import { config } from "../api/config";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import {
    bindSettingsModalEvents,
    generateSettingsModalHTML,
    getTokenStatusState,
} from "../components/SettingsModal/index.js";
import notifications from "../utils/notificationManager.js";

class SettingsController {
    #button;
    #gitHubClient;
    #storage;
    #localStorage;
    #abortController = null;
    #closeModal = null;

    #isOpening = false;

    #modal = null;

    constructor(button, gitHubClient, storage, localStorage) {
        this.#button = button;
        this.#gitHubClient = gitHubClient;
        this.#storage = storage;
        this.#localStorage = localStorage;
    }

    init() {
        this.#bindEvents();
        return this;
    }

    #bindEvents() {
        this.#abortController?.abort();
        this.#abortController = new AbortController();
        this.#button.addEventListener("click", () => this.#openSettings(), { signal: this.#abortController.signal });
    }

    async #openSettings() {
        if (this.#isOpening || this.#modal?.isConnected) return;

        this.#isOpening = true;
        const { signal } = this.#abortController;
        const loader = generateLoader();

        try {
            const token = this.#storage.token;
            const tokenResult = token ? await this.#gitHubClient.setToken(token, { signal }) : { success: true };
            if (signal.aborted) return;
            const tokenState = getTokenStatusState(tokenResult, Boolean(token));

            const rateLimitRes = await this.#gitHubClient.getRateLimitData({ signal });
            if (signal.aborted) return;
            const modalHTML = generateSettingsModalHTML(rateLimitRes, tokenState, config.versionDetails, token);

            if (!modalHTML) return;

            const template = document.createElement("template");
            template.innerHTML = modalHTML.trim();
            const modal = template.content.firstElementChild;

            if (!modal) return;

            document.body.append(modal);
            this.#modal = modal;
            this.#closeModal = bindSettingsModalEvents(
                modal,
                () => {
                    if (this.#modal === modal) this.#modal = null;
                    this.#closeModal = null;
                },
                {
                    storage: this.#storage,
                    localStorage: this.#localStorage,
                    gitHubClient: this.#gitHubClient,
                },
            );
        } catch (error) {
            notifications.notify("Failed to open settings", "error");
            console.error("Failed to open settings:", error);
        } finally {
            this.#isOpening = false;
            removeLoader(loader);
        }
    }

    destroy() {
        this.#abortController?.abort();
        this.#abortController = null;
        this.#closeModal?.();
    }
}

export { SettingsController };
