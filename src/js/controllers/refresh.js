class RefreshButtonController {
    #button;
    #graph;
    #abortController = null;

    constructor(button, graph) {
        this.#button = button;
        this.#graph = graph;
    }

    init() {
        this.#bindEvents();
        return this;
    }

    #bindEvents() {
        this.#abortController?.abort();
        this.#abortController = new AbortController();
        this.#button.addEventListener("click", () => this.#graph.refresh(), { signal: this.#abortController.signal });
    }

    destroy() {
        this.#abortController?.abort();
        this.#abortController = null;
    }
}

export { RefreshButtonController };
