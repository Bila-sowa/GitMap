import storage from "../data/storage.js";

export default class LocalStorage {
    #body = null;
    #storage = null;

    constructor() { this.#body = document.body; }

    save() {
        if (!storage.localStorage.saveLink) {
            storage.link = "";
        }

        if (!storage.localStorage.saveToken) {
            storage.token = "";
        }

        localStorage.setItem("GitMap", JSON.stringify(storage));
    }

    get() {
        try {
            const value = localStorage.getItem("GitMap");
            let parse = {};

            if (value) parse = JSON.parse(value);

            return { data: parse, success: true }
        } catch (err) {
            // showError
            return { error: err.name, success: false }
        }
    }

    load() { data = storage }
}
