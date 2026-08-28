import storage from "../data/storage.js";
import * as DOM from "./dom.js";
import graphController from "./graph.js";
import localStorage from "./localStorage.js";

class LinkController {
    #input;
    #graph;

    constructor(input, graph) {
        this.#input = input;
        this.#graph = graph;
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
                localStorage.save();
            }

            this.#graph.render();
        });
    }
}

const linkInput = new LinkController(DOM.linkInput, graphController);

export { LinkController };
export default linkInput;
