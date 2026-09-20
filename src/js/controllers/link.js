import storage from "../data/storage.js";
import * as DOM from "./dom.js";
import graph from "./graph.js";
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
        this.#input.addEventListener("keydown", (e) => {
            const value = this.#input.value.trim();
            if (e.code === "Enter") this.#setLink(value);
        });

        this.#input.addEventListener("blur", () => {
            const value = this.#input.value.trim();
            if (this.#input.value.trim()) this.#setLink(value);
        });
    }

    #setLink(value) {
        storage.link = value;
        if (storage.saveLink) localStorage.save();
        this.#graph.render();
    }
}

const linkInput = new LinkController(DOM.linkInput, graph);

export { LinkController };
export default linkInput;
