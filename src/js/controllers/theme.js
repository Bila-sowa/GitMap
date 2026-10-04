class ThemeController {
    #button;
    #body;
    #storage;
    #localStorage;
    #themeColorMeta;
    #abortController = null;

    constructor(button, body, storage, localStorage) {
        this.#button = button;
        this.#body = body;
        this.#storage = storage;
        this.#localStorage = localStorage;
        this.#themeColorMeta = document.querySelector("#theme-color");
    }

    init() {
        this.#setTheme(this.#storage.theme || "dark-theme");
        this.#bindEvents();
        return this;
    }

    #bindEvents() {
        this.#abortController?.abort();
        this.#abortController = new AbortController();
        this.#button.addEventListener("click", () => this.#changeTheme(), { signal: this.#abortController.signal });
    }

    #setTheme(theme) {
        const validTheme = theme === "light-theme" || theme === "dark-theme" ? theme : "dark-theme";

        this.#body.classList.remove("dark-theme", "light-theme");
        this.#body.classList.add(validTheme);
        this.#storage.theme = validTheme;

        if (this.#themeColorMeta) {
            const themeColor = getComputedStyle(this.#body).getPropertyValue("--color-1").trim();
            if (themeColor) this.#themeColorMeta.content = themeColor;
        }

        this.#localStorage.save();
    }

    #changeTheme() {
        const theme = this.#storage.theme === "dark-theme" ? "light-theme" : "dark-theme";
        this.#setTheme(theme);
    }

    destroy() {
        this.#abortController?.abort();
        this.#abortController = null;
    }
}

export { ThemeController };
