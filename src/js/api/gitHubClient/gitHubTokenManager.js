import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";

class GitHubTokenManager {
    #headers;
    #httpApi;
    #storage;
    #fetch;
    #tokenOperationId = 0;

    constructor(headers, httpApi, storageInstance = storage, fetcher = globalThis.fetch) {
        this.#headers = headers;
        this.#httpApi = httpApi;
        this.#storage = storageInstance;
        this.#fetch = fetcher;
    }

    #getSafeHeaders(url, authorization = this.#headers.Authorization) {
        const headers = { Accept: this.#headers.Accept };
        let hostname = "";

        try {
            hostname = new URL(url).hostname;
        } catch (error) {
            console.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error);
        }

        if (hostname === "api.github.com" && authorization) {
            headers.Authorization = authorization;
        }

        return headers;
    }

    async #validateToken(token) {
        try {
            const url = "https://api.github.com/rate_limit";
            const res = await this.#fetch(url, {
                headers: this.#getSafeHeaders(url, `Bearer ${token}`),
            });

            if (!res.ok) {
                const httpError = await this.#httpApi.createHttpError(res, url);
                return { success: false, ...httpError };
            }

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: "Failed to validate GitHub token",
                devError: {
                    message: `Network or fetch exception in #validateToken: ${err.message}`,
                    stack: err.stack,
                },
            };
        }
    }

    async setToken(token) {
        const operationId = ++this.#tokenOperationId;

        if (!token) {
            delete this.#headers.Authorization;
            this.#storage.token = "";
            return { success: true };
        }

        const validation = await this.#validateToken(token);

        if (operationId !== this.#tokenOperationId) {
            return { success: false, cancelled: true };
        }

        if (!validation.success) {
            notifications.notify(validation.error, "error");
            return validation;
        }

        this.#storage.token = token;
        this.#headers.Authorization = `Bearer ${token}`;
        notifications.notify("The token has been successfully set", "success");
        return { success: true };
    }

    getHeaders() {
        return { ...this.#headers };
    }

    getAuthorizationHeader() {
        return this.#headers.Authorization || null;
    }
}

export default GitHubTokenManager;
