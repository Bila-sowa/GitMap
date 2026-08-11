import storage from "../data/storage.js";
import GitHubClient from "../services/getGitHubData.js";
import Modal from "./modal.js";

export default class Graph {
    #graph = null;
    #client = null;
    #data = null;

    constructor(graphElement) {
        this.#graph = graphElement;
        new Modal(this.#graph, {
            getData: () => this.#data,
            getClient: () => this.#client,
        });
    }

    async render() {
        if (!storage.link) return;

        await this.#getData(storage.link);

        if (!this.#data?.success) return;

        this.#generateGraph(this.#data.commitsDetails)
    }

    async #getData(link) {
        this.#client = new GitHubClient(link);
        this.#data = await this.#client.getData();
    }

    #truncateTitle(title) {
        const words = title.trim().split(/\s+/);
        return words.length > 5 ? words.slice(0, 3).join(" ") + "..." : title;
    }

    #generateGraph(array) {
        if (!array) return;

        this.#graph.innerHTML = "";

        array.forEach((commit, index) => {
            const isLast = index === this.#data.commitsDetails.length - 1;
            const formattedTitle = this.#truncateTitle(commit.title);

            const commitCard = `
                <button class="commit neon rounded-full" data-id="${index}" name="${formattedTitle}" aria-expanded="false" aria-label="Open commit: ${commit.title}"></button>
                ${isLast
                    ? `<span class="limit-description text-smallest">The REST API supports only the last 30 commits from one branch.</span>` : `
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

