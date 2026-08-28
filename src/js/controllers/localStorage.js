import storage from "../data/storage.js";
import notifications from "../utils/notificationManager.js";

class LocalStorageController {
    save() {
        const currentData = storage.getData();
        const dataToSave = {
            ...currentData,
            localStorage: { ...currentData.localStorage },
            link: storage.saveLink ? storage.link : "",
            token: storage.saveToken ? storage.token : "",
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
            notifications.notify(
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
            storage.theme = data.theme;
        }

        if (data.localStorage) {
            storage.localStorage = data.localStorage;
        }

        if (storage.saveLink && data.link) {
            storage.link = data.link;
        }

        if (storage.saveToken && data.token) {
            storage.token = data.token;
        }

        return { success: true, data: storage.getData() };
    }
}

const localStorageController = new LocalStorageController();
localStorageController.load();

export { LocalStorageController };
export default localStorageController;
