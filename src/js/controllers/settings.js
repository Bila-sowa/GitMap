import gitHubClient from "../api/gitHubClient.js";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import { bindSettingsModalEvents, generateSettingsModalHTML } from "../components/SettingsModal/index.js";
import storage from "../data/storage.js";
import { appendHTML, getConfigData } from "../utils/utils.js";
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
        storage.token ? await gitHubClient.setToken(storage.token) : "";

        generateLoader();

        const rateLimitRes = await gitHubClient.getRateLimitData();
        const limit = rateLimitRes.data;
        const config = await getConfigData();
        const versionDetails = config.versionDetails;

        removeLoader();

        const modal = generateSettingsModalHTML(limit, versionDetails);

        if (!modal) return;

        appendHTML(modal);
        bindSettingsModalEvents();
    }
}

const settingsController = new SettingsController(DOM.settingsButton);

export { SettingsController };
export default settingsController;
