import storage from "../data/storage.js";
import * as DOM from "./dom.js";
import { LocalStorageController } from "./localStorage.js";

class ThemeController {
    #button;
    #localStorage = new LocalStorageController();

    constructor(button) {
        this.#button = button;
        this.#setTheme(storage.theme || "dark-theme");
        this.#bindEvents();
    }

    #bindEvents() {
        this.#button.addEventListener("click", () => this.#changeTheme());
    }

    #setTheme(theme) {
        const validTheme = theme === "light-theme" || theme === "dark-theme" ? theme : "dark-theme";

        document.body.classList.remove("dark-theme", "light-theme");
        document.body.classList.add(validTheme);
        storage.theme = validTheme;

        this.#localStorage.save();
    }

    #changeTheme() {
        const theme = storage.theme === "dark-theme" ? "light-theme" : "dark-theme";
        this.#setTheme(theme);
    }
}

const themeController = new ThemeController(DOM.themeButton);

export { ThemeController };
export default themeController;
