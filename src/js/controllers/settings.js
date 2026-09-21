import gitHubClient from "../api/gitHubClient";
import { config } from "../api/config";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import { bindSettingsModalEvents, generateSettingsModalHTML } from "../components/SettingsModal/index.js";
import storage from "../data/storage.js";
import notifications from "../utils/notificationManager.js";
import { appendHTML } from "../utils/utils.js";
import * as DOM from "./dom.js";

class SettingsController {
    #button;

    constructor(button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents() {
        this.#button.addEventListener("click", () => this.#openSettings());
    }

    async #openSettings() {
        const loader = generateLoader();

        try {
            if (storage.token) await gitHubClient.setToken(storage.token);

            const rateLimitRes = await gitHubClient.getRateLimitData();
            const modal = generateSettingsModalHTML(rateLimitRes.data, config.versionDetails);

            if (!modal) return;

            appendHTML(modal);
            bindSettingsModalEvents();
        } catch (error) {
            notifications.notify("Failed to open settings", "error");
            console.error("Failed to open settings:", error);
        } finally {
            removeLoader(loader);
        }
    }
}

const settings = new SettingsController(DOM.settingsButton);

export { SettingsController };
export default settings;
