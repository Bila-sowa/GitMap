class LocalStorageController {
    #storage;
    #notifications;

    constructor(storage, notifications) {
        this.#storage = storage;
        this.#notifications = notifications;
    }

    init() {
        return this.load();
    }

    destroy() {}

    save() {
        const currentData = this.#storage.getData();
        const dataToSave = {
            ...currentData,
            localStorage: { ...currentData.localStorage },
            link: this.#storage.saveLink ? this.#storage.link : "",
            token: this.#storage.saveToken ? this.#storage.token : "",
        };

        try {
            globalThis.localStorage.setItem("GitMap", JSON.stringify(dataToSave));
            return { success: true };
        } catch (err) {
            this.#notifications.notify("Unable to save data in local storage.", "error");
            return { error: err.name, success: false };
        }
    }

    get() {
        try {
            const value = globalThis.localStorage.getItem("GitMap");
            let parse = {};

            if (value) parse = JSON.parse(value);

            if (!parse || typeof parse !== "object" || Array.isArray(parse)) {
                return { data: {}, success: false };
            }

            return { data: parse, success: true };
        } catch (err) {
            this.#notifications.notify(
                "Invalid local storage parse. Please check your data in the local storage or delete its data.",
                "error",
            );
            return { error: err.name, success: false };
        }
    }

    load() {
        const result = this.get();
        if (!result.success || !result.data || !Object.keys(result.data).length) {
            return { success: false, data: null };
        }

        const data = result.data;

        if (data.theme) {
            this.#storage.theme = data.theme;
        }

        if (data.localStorage) {
            this.#storage.localStorage = data.localStorage;
        }

        if (this.#storage.saveLink && data.link) {
            this.#storage.link = data.link;
        }

        if (this.#storage.saveToken && data.token) {
            this.#storage.token = data.token;
        }

        return { success: true, data: this.#storage.getData() };
    }
}

export { LocalStorageController };
