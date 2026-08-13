import storage from "../data/storage.js";
import GitHubClient from "../services/getGitHubData.js";
import { generateFullCommitModalHTML, bindFullComitEvents } from "../components/fullCommitModal/index.js";
import { generateHoverCommitModalHTML, closeHoverCommitModals } from "../components/hoverCommitModal/index.js";
import { positionModalNearElement, truncateTitle } from "../utils/utils.js";

export default class Graph {
    #body = document.querySelector("body");
    #graph = null;
    #client = new GitHubClient();
    #link = null;
    #data = null;

    constructor(graphElement) {
        this.#graph = graphElement;
    };

    async render() {
        if (!storage.link) return;

        await this.#getGeneralData(storage.link);

        if (!this.#data?.success) return;

        this.#generateGraph(this.#data.commitsDetails);
        this.#bindEvents()
    };

    async #getGeneralData(link) {
        if (!link) return;

        await this.#client.setToken(storage?.token)

        this.#link = link;
        this.#data = await this.#client.getData(link);
    };

    #getFilesData = async (sha) => {
        if (!this.#link || !sha) return;

        await this.#client.setToken(storage?.token);

        const filesData = await this.#client.getCommitFiles(this.#link, sha);

        return filesData;
    }

    #generateGraph(array) {
        if (!array) return;

        this.#graph.innerHTML = "";
        this.#graph.dataset.repoUrl = storage.link;

        array.forEach((commit, index) => {
            const isLast = index === this.#data.commitsDetails.length - 1;
            const formattedTitle = truncateTitle(commit.title, 5);

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
    };

    #appendHTML(HTML) {
        if (!HTML) return;
        this.#body.insertAdjacentHTML("beforeend", HTML)
    }

    #bindEvents() {
        this.#graph.addEventListener("click", async (e) => {
            const commitButton = e.target.closest("[data-id]");
            if (!commitButton) return;

            const { id, sha } = commitButton.dataset;

            this.#appendHTML(generateFullCommitModalHTML(this.#data?.commitsDetails[id], await this.#getFilesData(sha)));
            bindFullComitEvents();
        });

        this.#graph.addEventListener("mouseover", (e) => {
            const commitButton = e.target.closest("[data-id]");
            if (!commitButton) return;

            const { id } = commitButton.dataset;

            this.#appendHTML(generateHoverCommitModalHTML(this.#data?.commitsDetails[id]));

            const modal = this.#body.querySelector("#hover-commit-modal");
            console.log(modal, commitButton)


            if (modal) {
                positionModalNearElement(modal, commitButton);
            }
        });

        this.#graph.addEventListener("mouseout", () => closeHoverCommitModals());
    }
}


