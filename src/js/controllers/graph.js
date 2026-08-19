import storage from "../data/storage.js";
import GitHubClient from "../services/getGitHubData.js";
import { generateFullCommitModalHTML, bindFullComitEvents } from "../components/FullCommitModal/index.js";
import { generateHoverCommitModalHTML, closeHoverCommitModals } from "../components/HoverCommitModal/index.js";
import { appendHTML, positionModalNearElement, truncateTitle } from "../utils/utils.js";
import { generateLoader, removeLoader } from "../components/Loader/index.js";

export default class GraphController {
    #body = document.querySelector("body");
    #graph = null;
    #client = new GitHubClient();
    #link = null;
    #data = null;
    #eventsController = null;

    constructor(graphElement) {
        this.#graph = graphElement;
    };

    async render() {
        if (!storage.link) return;

        generateLoader();

        await this.#getGeneralData(storage.link);

        removeLoader();
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

    #bindEvents() {
        if (this.#eventsController) this.#eventsController.abort();
        this.#eventsController = new AbortController();
        const { signal } = this.#eventsController;

        this.#graph.addEventListener("click", async (e) => {
            const commitButton = e.target.closest("[data-id]");
            if (!commitButton) return;

            const { id, sha } = commitButton.dataset;

            generateLoader();

            const modal = generateFullCommitModalHTML(this.#data?.commitsDetails[id], await this.#getFilesData(sha));

            removeLoader();

            if (!modal) return;

            appendHTML(modal);

            bindFullComitEvents();
        }, { signal });

        this.#graph.addEventListener("mouseover", (e) => {
            const commitButton = e.target.closest("[data-id]");
            if (!commitButton) return;

            const { id } = commitButton.dataset;

            const modal = generateHoverCommitModalHTML(this.#data?.commitsDetails[id]);

            if (!modal) return;

            appendHTML(modal);

            const modalDOM = this.#body.querySelector("#hover-commit-modal");

            if (modal) {
                positionModalNearElement(modalDOM, commitButton);
            }
        }, { signal });

        this.#graph.addEventListener("mouseout", () => closeHoverCommitModals(), { signal });
    }
}


