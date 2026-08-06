export default class LocalStorage {
    #body = null;
    #graph = null;

    constructor (graph, gitHubClient) {
        this.#body = document.body;
        this.#graph = graph
    }

    set (data) {
        localStorage.setItem("GitMap", JSON.stringify(data));
    }

    get () {
        try {
            const value = localStorage.getItem("GitMap");
            let parse = {};

            if (value) parse = JSON.parse(value);

            return { data: parse, success: true }
        } catch (err) {
            // showError
            return { error: err.name, success: false }
        }
    }

    load () {
        const data = this.#get

        if (data.theme) {
            this.#body.classList.remove("dark-theme", "light-theme");
            this.#body.classList.add(data.theme)
        };
        if (data.repo) this.#graph?.render(data.repo);
        if (data.token) this.gitHubClient.setToken(data.token);
    }
}
