import storage from "../data/storage.js";
import * as DOM from "./dom.js";
import graphController from "./graph.js";
import { LocalStorageController } from "./localStorage.js";

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
            if (storage.saveLink) {
                this.#localStorage.save();
            }

            this.#graph.render();
        });
    }
}

const linkController = new LinkController(DOM.linkInput, graphController);

export { LinkController };
export default linkController;
