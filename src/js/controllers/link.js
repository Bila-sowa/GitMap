class LinkController {
    #input;
    #graph;
    #storage;
    #localStorage;
    #abortController = null;

    constructor(input, graph, storage, localStorage) {
        this.#input = input;
        this.#graph = graph;
        this.#storage = storage;
        this.#localStorage = localStorage;
    }

    init() {
        this.#input.value = this.#storage.link || "";
        this.#bindEvents();
        return this;
    }

    #bindEvents() {
        this.#abortController?.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        this.#input.addEventListener(
            "keydown",
            (e) => {
                const value = this.#input.value.trim();
                if (e.code === "Enter") this.#setLink(value);
            },
            { signal },
        );

        this.#input.addEventListener(
            "blur",
            () => {
                const value = this.#input.value.trim();
                if (this.#input.value.trim()) this.#setLink(value);
            },
            { signal },
        );
    }

    #setLink(value) {
        this.#storage.link = value;
        if (this.#storage.saveLink) this.#localStorage.save();
        this.#graph.render();
    }

    destroy() {
        this.#abortController?.abort();
        this.#abortController = null;
    }
}

export { LinkController };
