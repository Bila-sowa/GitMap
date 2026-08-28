import * as DOM from "./dom.js";
import graphController from "./graph.js";

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

const refreshButtonController = new RefreshButtonController(DOM.refreshButton, graphController);

export { RefreshButtonController };
export default refreshButtonController;
