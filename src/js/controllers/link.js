import LocalStorageController from "./localStorage";
import storage from "../data/storage";

class LinkController {
    #input;
    #graph;
    #localStorage;

    constructor(input, graph) {
        this.#input = input;
        this.#graph = graph;
        this.#localStorage = new LocalStorageController();
        this.#input.value = storage.link || "";
        this.#bindEvents();
    }

    #bindEvents() {
        this.#input.addEventListener("blur", () => {
            const inputValue = this.#input.value.trim();
            if (!inputValue) {
                return;
            }

            storage.link = inputValue;
            if (storage.localStorage.saveLink) {
                this.#localStorage.save();
            }

            this.#graph.render();
        });
    }
}

export default LinkController;
