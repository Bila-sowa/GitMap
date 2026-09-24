import gitHubClient from "../api/gitHubClient";
import { config } from "../api/config";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import {
    bindSettingsModalEvents,
    generateSettingsModalHTML,
    getTokenStatusState,
} from "../components/SettingsModal/index.js";
import storage from "../data/storage.js";
import notifications from "../utils/notificationManager.js";
import * as DOM from "./dom.js";

class SettingsController {
    #button;

    #isOpening = false;

    #modal = null;

    constructor(button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents() {
        this.#button.addEventListener("click", () => this.#openSettings());
    }

    async #openSettings() {
        if (this.#isOpening || this.#modal?.isConnected) return;

        this.#isOpening = true;
        const loader = generateLoader();

        try {
            const token = storage.token;
            const tokenResult = token ? await gitHubClient.setToken(token) : { success: true };
            const tokenState = getTokenStatusState(tokenResult, Boolean(token));

            const rateLimitRes = await gitHubClient.getRateLimitData();
            const modalHTML = generateSettingsModalHTML(rateLimitRes, tokenState, config.versionDetails);

            if (!modalHTML) return;

            const template = document.createElement("template");
            template.innerHTML = modalHTML.trim();
            const modal = template.content.firstElementChild;

            if (!modal) return;

            document.body.append(modal);
            this.#modal = modal;
            bindSettingsModalEvents(modal, () => {
                if (this.#modal === modal) this.#modal = null;
            });
        } catch (error) {
            notifications.notify("Failed to open settings", "error");
            console.error("Failed to open settings:", error);
        } finally {
            this.#isOpening = false;
            removeLoader(loader);
        }
    }
}

const settings = new SettingsController(DOM.settingsButton);

export { SettingsController };
export default settings;
