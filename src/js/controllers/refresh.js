class RefreshButtonController {
    #button
    #graph

    constructor(button, graph) {
        this.#button = button;
        this.#graph = graph;
        this.#bindEvents();
    }

    #bindEvents() { this.#button.addEventListener("click", () => this.#graph.render()) }
}

export default RefreshButtonController;

