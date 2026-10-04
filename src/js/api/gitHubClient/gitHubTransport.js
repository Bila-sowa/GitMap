import { config } from "@/js/api/config";
import RequestControl from "./requestControl";

class GitHubTransport {
    #headers;
    #httpApi;
    #fetch;
    #onResponse;

    constructor(headers, httpApi, { fetcher, onResponse } = {}) {
        this.#headers = headers;
        this.#httpApi = httpApi;
        this.#fetch = fetcher || ((...args) => globalThis.fetch(...args));
        this.#onResponse = onResponse;
    }

    #getSafeHeaders(url, authorization = this.#headers.Authorization) {
        const headers = { Accept: this.#headers.Accept };

        try {
            if (new URL(url).origin === "https://api.github.com" && authorization) {
                headers.Authorization = authorization;
            }
        } catch (error) {
            console.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error);
        }

        return headers;
    }

    #getNextPage(response, url) {
        const link = response.headers?.get?.("Link");
        const next = link?.split(",").find((part) => /;\s*rel="?next"?/i.test(part));
        const match = next?.match(/<([^>]+)>/);

        if (!match) return null;

        const nextUrl = new URL(match[1], url);
        if (nextUrl.origin !== "https://api.github.com") {
            throw new Error("Invalid GitHub pagination URL");
        }

        return nextUrl.href;
    }

    async getJson(url, options = {}) {
        const {
            signal,
            authorization,
            paginate = false,
            parseJson = true,
            error: errorMessage = "Failed to fetch GitHub data",
            context = "getJson",
        } = options;
        const request = new RequestControl(signal, config.gitHub.REQUEST_TIMEOUT_MS);
        const pages = [];
        const visited = new Set();
        let nextUrl = url;

        try {
            while (nextUrl) {
                if (visited.has(nextUrl)) throw new Error("GitHub pagination loop detected");
                visited.add(nextUrl);

                const response = await this.#fetch(nextUrl, {
                    headers: this.#getSafeHeaders(nextUrl, authorization),
                    signal: request.signal,
                });
                if (new URL(response.url || nextUrl).origin === "https://api.github.com") {
                    this.#onResponse?.(response);
                }

                if (!response.ok) {
                    const httpError = await this.#httpApi.createHttpError(response, nextUrl);
                    return { success: false, ...httpError };
                }

                if (!parseJson) return { success: true };

                const data = await response.json();
                if (!paginate) return { success: true, data };
                if (!Array.isArray(data)) throw new Error("Expected an array in paginated GitHub response");

                pages.push(...data);
                nextUrl = this.#getNextPage(response, nextUrl);
            }

            return { success: true, data: pages };
        } catch (err) {
            if (request.didTimeout()) {
                return { success: false, timedOut: true, error: "GitHub request timed out" };
            }

            if (err.name === "AbortError" || request.signal.aborted) {
                return { success: false, cancelled: true };
            }

            return {
                success: false,
                error: errorMessage,
                devError: {
                    message: `Network or fetch exception in ${context}: ${err.message}`,
                    stack: err.stack,
                },
            };
        } finally {
            request.cleanup();
        }
    }
}

export default GitHubTransport;
