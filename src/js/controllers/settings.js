import storage from "../data/storage.js";
import GitHubClient from "../services/getGitHubData.js";
import { appendHTML, getVersion } from "../utils/utils.js";
import { bindSettingsModalEvents, generateSettingsModalHTML } from "../components/SettingsModal/index.js";
import { generateLoader, removeLoader } from "../components/Loader/index.js";

export default class SettingsController {
    #button
    #client = new GitHubClient();

    constructor(button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#openSettings()) }

    async #openSettings() {
        storage.token ? await this.#client.setToken(storage.token) : "";

        generateLoader();

        const rateLimitRes = await this.#client.getRateLimit();
        const limit = rateLimitRes?.success ? rateLimitRes.data : { usedPerNumber: 0, limitPerNumber: 0, usedPerPercent: 0 };
        const version = await getVersion();

        removeLoader();

        appendHTML(generateSettingsModalHTML(limit, version));
        bindSettingsModalEvents();
    };
};
