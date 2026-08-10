import storage from "../data/storage.js";
import config from "../data/config.js";
import LocalStorage from "./localStorage.js";
import GitHubClient from "../services/getGitHubData.js";
import getRateLimit from "../utils/getRateLimit.js";

class Input {
    #input
    #graph
    #localStorage

    constructor(input, graph) {
        this.#input = input;
        this.#graph = graph;
        this.#localStorage = new LocalStorage();
        this.#input.value = storage.link || "";
        this.#bindEvents();
    }

    #bindEvents() {
        this.#input.addEventListener("blur", () => {
            const inputValue = this.#input.value.trim();
            if (!inputValue) {
                return;
            }

            storage.link = inputValue;
            if (storage.localStorage.saveLink) {
                this.#localStorage.save();
            }

            this.#graph.render();
        });
    }
}

class Refresh {
    #button
    #graph

    constructor(button, graph) {
        this.#button = button;
        this.#graph = graph;
        this.#bindEvents();
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#graph.render()) }
}

class Theme {
    #button;

    constructor(button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#changeTheme()) }

    #setTheme(theme) {
        document.body.classList.remove("dark-theme", "light-theme");
        document.body.classList.add(theme);
        storage.theme = theme;
    }

    #changeTheme() {
        const theme = storage.theme === "dark-theme" ? "light-theme" : "dark-theme";
        this.#setTheme(theme)
    }
}

class Settings {
    #body
    #button
    #localStorage

    constructor(button) {
        this.#body = document.querySelector("body");
        this.#button = button;
        this.#localStorage = new LocalStorage();
        this.#bindEvents();
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#openSettings()) }

    async #openSettings() {
        const limit = await getRateLimit();
        const card = `
            <div class="overlay" id="overlay">
                <div class="settings-modal" id="settings-modal" role="dialog">
                    <div class="settings-header">
                        <h1>Settings</h1>
                        <button class="close-button" id="close-button">&times;</button>
                    </div>
                    <div class="settings-content">
                        <div class="settings-section">
                            <h3>GitHub</h3>
                            <div class="settings-item rounded-normal border-sm">
                                <label for="token-input">GitHub Rest Api Token</label>
                                <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" placeholder="gpy_">
                            </div>
                        </div>
                        <div class="settings-section"> 
                            <h3>LocalStorage</h3>
                            <div class="settings-item rounded-normal border-sm">
                                <span for="save-link">Save current repo in page</span>
                                <input class="hidden toggle-input" type="checkbox" id="save-link">
                                <label class="toggle-button rounded-full" for="save-link" aria-label="toggle save link option"></label>
                            </div>
                            <div class="settings-item rounded-normal border-sm">
                                <span>Save current token in page</span>
                                <input class="hidden toggle-input" type="checkbox" id="save-token">
                                <label class="toggle-button rounded-full" for="save-token" aria-label="toggle save token option"></label>
                            </div>
                            <div class="settings-item rounded-normal border-sm">
                                <span>Rest API Limit:</span>
                                <div class="rest-api-limit-progress rounded-full border-normal" title="Used: ${limit.usedPerNumber} / ${limit.limitPerNumber}">
                                    <span class="rest-api-limit-bar" style="width: ${limit.usedPerPercent}%"></span>
                                </div>
                            </div>
                        </div>
                        <span class="version-text text-small">Version: ${config.version}</span>
                    </div>
                </div>
            </div>
        `;

        this.#body.insertAdjacentHTML("beforeend", card);

        const modal = document.querySelector("#overlay");
        const closeButton = modal.querySelector(".close-button");
        const saveLinkToggle = document.querySelector("#save-link");
        const saveTokenToggle = document.querySelector("#save-token");

        closeButton.addEventListener("click", () => {
            modal.remove();
        })

        document.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.code === "Escape" || e.target !== modal) {
                modal.remove()
            };
        })

        saveLinkToggle.checked = storage.localStorage.saveLink;
        saveLinkToggle.addEventListener("change", () => {
            storage.localStorage.saveLink = saveLinkToggle.checked;
            this.#localStorage.save();
        })

        saveTokenToggle.checked = storage.localStorage.saveToken;
        saveTokenToggle.addEventListener("change", () => {
            storage.localStorage.saveToken = saveTokenToggle.checked;
            this.#localStorage.save();
        })


    }

}

class Downdrop {

}

export {
    Input,
    Refresh,
    Theme,
    Settings,
    Downdrop,
}
