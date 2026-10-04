import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";
import GitHubTransport from "./gitHubTransport";

class GitHubTokenManager {
    #headers;
    #storage;
    #transport;
    #tokenOperationId = 0;

    constructor(headers, httpApi, storageInstance = storage, fetcher, transport) {
        this.#headers = headers;
        this.#storage = storageInstance;
        this.#transport = transport || new GitHubTransport(headers, httpApi, { fetcher });
    }

    async #validateToken(token, options = {}) {
        return this.#transport.getJson("https://api.github.com/rate_limit", {
            signal: options.signal,
            authorization: `Bearer ${token}`,
            parseJson: false,
            error: "Failed to validate GitHub token",
            context: "#validateToken",
        });
    }

    async setToken(token, options = {}) {
        const operationId = ++this.#tokenOperationId;

        if (!token) {
            delete this.#headers.Authorization;
            this.#storage.token = "";
            return { success: true };
        }

        const validation = await this.#validateToken(token, options);

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
