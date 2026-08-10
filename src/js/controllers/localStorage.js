import storage from "../data/storage.js";
import { createNotification } from "../utils/utils.js";

export default class LocalStorage {
    save() {
        const dataToSave = {
            ...storage,
            localStorage: { ...storage.localStorage },
        };

        if (!storage.localStorage.saveLink) {
            dataToSave.link = "";
        }

        if (!storage.localStorage.saveToken) {
            dataToSave.token = "";
        }

        localStorage.setItem("GitMap", JSON.stringify(dataToSave));
    }

    get() {
        try {
            const value = localStorage.getItem("GitMap");
            let parse = {};

            if (value) parse = JSON.parse(value);

            return { data: parse, success: true };
        } catch (err) {
            createNotification("Invalid local storage parse. Please check your data in the local storage or delete its data.", "error")
            return { error: err.name, success: false };
        }
    }

    load() {
        const result = this.get();
        if (!result.success || !result.data || !Object.keys(result.data).length) {
            return { success: false, data: null };
        }

        Object.assign(storage, result.data);

        if (!storage.localStorage.saveLink) {
            storage.link = "";
        }

        if (!storage.localStorage.saveToken) {
            storage.token = "";
        }

        return { success: true, data: storage };
    }
}
