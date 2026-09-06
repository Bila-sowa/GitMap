import * as DOM from "./dom.js";
import graph from "./graph.js";

class RefreshButtonController {
    #button;
    #graph;

    constructor(button, graph) {
        this.#button = button;
        this.#graph = graph;
        this.#bindEvents();
    }

    #bindEvents() {
        this.#button.addEventListener("click", () => this.#graph.render());
    }
}

const refresh = new RefreshButtonController(DOM.refreshButton, graph);

export { RefreshButtonController };
export default refresh;
