class Storage {
    #link = "";
    #theme = "dark-theme";
    #token = "";
    #localStorage = {
        saveLink: false,
        saveToken: false,
    };

    constructor(initialState = {}) {
        this.setData(initialState);
    }

    get link() {
        return this.#link;
    }

    set link(value) {
        this.#link = typeof value === "string" ? value.trim() : "";
    }

    get theme() {
        return this.#theme;
    }

    set theme(value) {
        this.#theme = value === "light-theme" || value === "dark-theme" ? value : "dark-theme";
    }

    get token() {
        return this.#token;
    }

    set token(value) {
        this.#token = typeof value === "string" ? value.trim() : "";
    }

    get localStorage() {
        return this.#localStorage;
    }

    set localStorage(options) {
        if (options && typeof options === "object") {
            if (typeof options.saveLink === "boolean") {
                this.#localStorage.saveLink = options.saveLink;
            }
            if (typeof options.saveToken === "boolean") {
                this.#localStorage.saveToken = options.saveToken;
            }
        }
    }

    get saveLink() {
        return this.#localStorage.saveLink;
    }

    set saveLink(value) {
        this.#localStorage.saveLink = Boolean(value);
    }

    get saveToken() {
        return this.#localStorage.saveToken;
    }

    set saveToken(value) {
        this.#localStorage.saveToken = Boolean(value);
    }

    getLink() {
        return this.link;
    }

    setLink(value) {
        this.link = value;
    }

    getTheme() {
        return this.theme;
    }

    setTheme(value) {
        this.theme = value;
    }

    getToken() {
        return this.token;
    }

    setToken(value) {
        this.token = value;
    }

    getSaveLink() {
        return this.saveLink;
    }

    setSaveLink(value) {
        this.saveLink = value;
    }

    getSaveToken() {
        return this.saveToken;
    }

    setSaveToken(value) {
        this.saveToken = value;
    }

    getLocalStorage() {
        return { ...this.#localStorage };
    }

    setLocalStorage(options) {
        this.localStorage = options;
    }

    getData() {
        return {
            link: this.#link,
            theme: this.#theme,
            token: this.#token,
            localStorage: { ...this.#localStorage },
        };
    }

    setData(data = {}) {
        if (!data || typeof data !== "object") return;

        if (data.link !== undefined) {
            this.link = data.link;
        }

        if (data.theme !== undefined) {
            this.theme = data.theme;
        }

        if (data.token !== undefined) {
            this.token = data.token;
        }

        if (data.localStorage !== undefined) {
            this.localStorage = data.localStorage;
        }
    }

    reset() {
        this.#link = "";
        this.#theme = "dark-theme";
        this.#token = "";
        this.#localStorage = {
            saveLink: false,
            saveToken: false,
        };
    }
}

const storage = new Storage();
export { Storage };
export default storage;
