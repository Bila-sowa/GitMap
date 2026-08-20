import storage from "../data/storage.js";
import notifications from "../utils/notificationManager.js";

export default class LocalStorageController {
    save() {
        const dataToSave = {
            ...storage,
            localStorage: { ...storage.localStorage },
            link: storage.localStorage.saveLink ? storage.link : "",
            token: storage.localStorage.saveToken ? storage.token : "",
        };

        localStorage.setItem("GitMap", JSON.stringify(dataToSave));
    }

    get() {
        try {
            const value = localStorage.getItem("GitMap");
            let parse = {};

            if (value) parse = JSON.parse(value);

            return { data: parse, success: true };
        } catch (err) {
            notifications.notify("Invalid local storage parse. Please check your data in the local storage or delete its data.", "error");
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
            storage.theme = data.theme;
        }

        if (data.localStorage) {
            Object.assign(storage.localStorage, data.localStorage);
        }

        if (storage.localStorage.saveLink && data.link) {
            storage.link = data.link;
        }

        if (storage.localStorage.saveToken && data.token) {
            storage.token = data.token;
        }

        return { success: true, data: storage };
    }
}
