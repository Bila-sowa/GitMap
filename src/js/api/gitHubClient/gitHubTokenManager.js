import notifications from "../../utils/notificationManager.js";
import storage from "../../data/storage.js";
import GitHubHttpApi from "../gitHubHttpApi.js";

class GitHubTokenManager extends GitHubHttpApi {
    #headers = { Accept: "application/vnd.github+json" };

    constructor() {
        super();
        if (storage.token) {
            this.setToken(storage.token);
        }
    }

    #getSafeHeaders(url) {
        const headers = { Accept: this.#headers.Accept };
        let hostname = "";

        try {
            hostname = new URL(url).hostname;
        } catch (error) {
            console.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error);
        }

        if (hostname === "api.github.com" && this.#headers.Authorization) {
            headers.Authorization = this.#headers.Authorization;
        }

        return headers;
    }

    async #validateToken() {
        try {
            const url = "https://api.github.com/rate_limit";
            const res = await fetch(url, {
                headers: this.#getSafeHeaders(url),
            });

            if (!res.ok) {
                const httpError = await this.createHttpError(res, url);
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
        if (!token) {
            delete this.#headers.Authorization;
            delete storage.token;
            return { success: true };
        }

        storage.token = token;
        this.#headers.Authorization = `Bearer ${token}`;
        const validation = await this.#validateToken();

        if (!validation.success) {
            delete this.#headers.Authorization;
            delete storage.token;
            notifications.notify(validation.error, "error");
            return validation;
        }

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

const gitHubTokenManager = new GitHubTokenManager();

export { GitHubTokenManager };
export default gitHubTokenManager;
