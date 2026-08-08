import storage from "../data/storage.js";
import config from "../data/config.js";
import LocalStorage from "./localStorage.js";


class Input {
    #input
    #graph
    #localStorage

    constructor(input, graph) {
        this.#input = input;
        this.#graph = graph;
        this.#localStorage = new LocalStorage();
        this.#bindEvents();
    }

    #bindEvents () {
        this.#input.addEventListener("blur", () => {
            // if (storage.settings.saveLink) {
            //     this.#localStorage = this.#input.value;
            // }

            storage.link = this.#input.value;
            this.#graph.render()
        })
    }
}

class Refresh {
    #button
    #graph 

    constructor (button, graph) {
        this.#button = button;
        this.#graph = graph;
        this.#bindEvents()
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#graph.render(storage.link))}
}

class Theme {
    #button;

    constructor (button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents () { this.#button.addEventListener("click", () => this.#changeTheme())}

    #setTheme (theme) {
        document.body.classList.remove("dark-theme", "light-theme");
        document.body.classList.add(theme);
        storage.theme = theme;
    }

    #changeTheme () {
        const theme = storage.theme === "dark-theme" ? "light-theme" : "dark-theme";
        this.#setTheme(theme)
    }
}

class Settings {
    #body
    #button

    constructor (button) {
        this.#body = document.querySelector("body");
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents () { this.#button.addEventListener("click", () => this.#openSettings())}

    #openSettings () {
        const card = `
            <div class="overlay">
                <div class="settings-modal" id="settings-modal" role="dialog">
                    <h2>Settings</h2>
                    <h3>GitHub</h3>
                    <div class="settings-item">
                        <label for="token-input">GitHub Rest Api Token</label>
                        <input type="password" id="token-input" placeholder="gpy_">
                    </div>
                    <h3>LocalStorage</h3>
                    <div class="settings-item">
                        <span for="save-link">Save current repo in page</span>
                        <label for="save-link"></label>
                        <input type="checkbox" id="save-link">
                    </div>
                    <div class="settings-item">
                        <span>Save current token in page</span>
                        <label for="save-token"></label>
                        <input type="checkbox" id="save-token">
                    </div>
                    <span>Version: ${config.version}</span>
                </div>
            </div>
        `;

        this.#body.insertAdjacentHTML("beforeend", card);
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
