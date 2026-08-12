import storage from "./data/storage.js";
import GitHubClient from "./services/getGitHubData.js";
import { createCommitModals } from "./components/Modals/index.js";

export default class Graph {
    #graph = null;
    #client = new GitHubClient();
    #data = null;

    constructor(graphElement) {
        this.#graph = graphElement;
        createCommitModals(this.#graph, {
            getData: () => this.#data,
            getClient: () => this.#client,
        });
    }

    get element() {
        return this.#graph;
    }

    get data() {
        return this.#data;
    }

    get client() {
        return this.#client;
    }

    async render() {
        if (!storage.link) return;

        await this.#getData(storage.link);

        if (!this.#data?.success) return;

        this.#generateGraph(this.#data.commitsDetails);
    }

    async #getData(link) {
        this.#data = await this.#client.getData(link);
    }

    #truncateTitle(title) {
        const words = title.trim().split(/\s+/);
        return words.length > 5 ? words.slice(0, 3).join(" ") + "..." : title;
    }

    #generateGraph(array) {
        if (!array) return;

        this.#graph.innerHTML = "";
        this.#graph.dataset.repoUrl = storage.link;

        array.forEach((commit, index) => {
            const isLast = index === this.#data.commitsDetails.length - 1;
            const formattedTitle = this.#truncateTitle(commit.title);

            const commitCard = `
                <button class="commit neon rounded-full" data-id="${index}" data-sha="${commit.sha}" name="${formattedTitle}" aria-expanded="false" aria-label="Open commit: ${commit.title}"></button>
                ${isLast
                    ? `<span class="limit-description text-smallest">The REST API supports only the last 30 commits from one branch.</span>`
                    : `
                <div class="connection neon">
                    <span></span>
                    <span></span>
                </div>
                `}
            `;

            this.#graph.insertAdjacentHTML("beforeend", commitCard);
        });
    }
}


