import storage from "../data/storage.js";
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

    #bindEvents() { this.#button.addEventListener("click", () => this.#graph.render(storage.link) )}
}

class Theme {
    #button;

    constructor (button) {
        this.#button = button;
        this.#bindEvents();
    }

    #bindEvents () { this.#button.addEventListener("click", () => this.#changeTheme()) }

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
