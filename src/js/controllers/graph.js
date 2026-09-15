import gitHubClient from "../api/gitHubClient";
import { config } from "../api/config";
import {
    bindFullComitEvents,
    closeFullCommitModals,
    generateFullCommitModalHTML,
} from "../components/FullCommitModal/index";
import { closeHoverCommitModals, generateHoverCommitModalHTML } from "../components/HoverCommitModal/index";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import storage from "../data/storage.js";
import notifications from "../utils/notificationManager.js";
import { appendHTML, escapeHTML, positionModalNearElement, truncateTitle } from "../utils/utils.js";
import * as DOM from "./dom.js";
import dropDown from "./dropDown";

class GraphController {
    #body = document.querySelector("body");
    #graph = null;
    #link = null;
    #data = null;
    #eventsController = null;
    #requestController = null;
    #requestId = 0;
    #currentBranch = null;

    constructor(graphElement) {
        this.#graph = graphElement;
    }

    async render() {
        const link = storage.link;
        if (!link) return { success: false, error: "Missing repository URL" };

        const request = this.#startRequest();

        generateLoader();

        try {
            const data = await gitHubClient.getData(link, { signal: request.signal });

            if (!this.#isCurrentRequest(request.id, link)) {
                return { success: false, cancelled: true };
            }

            if (!data.success) return data;

            this.#link = link;
            this.#data = data;
            this.#currentBranch = data.defaultBranch || data.branchesDetails[0] || null;

            this.#generateGraph(data.commitsDetails, this.#currentBranch);
            dropDown.render(data.branchesDetails, this.#currentBranch);
            this.#bindEvents();

            return { success: true, currentBranch: this.#currentBranch };
        } catch (error) {
            notifications.notify("Failed to render the repository graph", "error");
            return { success: false, error: error.message };
        } finally {
            if (request.id === this.#requestId) removeLoader();
        }
    }

    async renderByBranch(branch) {
        const branchName = typeof branch === "string" ? branch.trim() : "";
        const link = storage.link;

        if (!link || !branchName || !this.#data?.success || this.#link !== link) {
            return { success: false, error: "Repository data or branch name is missing" };
        }

        const request = this.#startRequest();

        generateLoader();

        try {
            const commits = await gitHubClient.getDataByBranch(branchName, link, { signal: request.signal });

            if (!this.#isCurrentRequest(request.id, link)) {
                return { success: false, cancelled: true };
            }

            if (!commits.success) return commits;

            this.#data = {
                ...this.#data,
                commitsDetails: commits.commitsDetails,
            };
            this.#currentBranch = branchName;

            this.#generateGraph(this.#data.commitsDetails, branchName);
            dropDown.setSelectedBranch(branchName);
            this.#bindEvents();

            return { success: true, currentBranch: branchName };
        } catch (error) {
            notifications.notify("Failed to render the selected branch", "error");
            return { success: false, error: error.message };
        } finally {
            if (request.id === this.#requestId) removeLoader();
        }
    }

    refresh() {
        if (this.#currentBranch && this.#link === storage.link) {
            return this.renderByBranch(this.#currentBranch);
        }

        return this.render();
    }

    #startRequest() {
        this.#requestController?.abort();
        this.#requestController = new AbortController();

        return {
            id: ++this.#requestId,
            signal: this.#requestController.signal,
        };
    }

    #isCurrentRequest(requestId, link) {
        return requestId === this.#requestId && link === storage.link;
    }

    #getFilesData = async (sha) => {
        if (!this.#link || !sha) return;

        const filesData = await gitHubClient.getCommitFiles(this.#link, sha);

        return filesData;
    };

    #generateGraph(array, branchName = "main") {
        if (!array) return;

        closeFullCommitModals();
        closeHoverCommitModals();
        this.#graph.innerHTML = "";
        this.#graph.dataset.repoUrl = storage.link;
        const safeBranchName = escapeHTML(branchName);

        array.forEach((commit, index) => {
            const GITHUB_RENDER_LIMIT = 30;
            const formattedTitle = truncateTitle(commit.title, 5);
            const renderLimit = +config.graph.renderLimit;

            if (index >= renderLimit) return;

            const isFirst = index === 0;
            const isLast = index === Math.min(array.length, renderLimit) - 1;

            const commitCard = `
                ${isFirst ? "<div class='triangular-connector'></div>" : ""}
                <button
                    class="
                        commit
                        neon
                        rounded-full
                        ${isFirst ? "head-commit" : ""}
                    "
                    data-id="${index}"
                    data-sha="${commit.sha}"
                    name="${formattedTitle}"
                    aria-expanded="false"
                    aria-label="Open commit: ${commit.title}"
                    aria-branch="${safeBranchName}"
                ></button>
                ${
                    isLast
                        ? `<span class="limit-description text-smallest">Showing up to ${renderLimit > GITHUB_RENDER_LIMIT ? GITHUB_RENDER_LIMIT : renderLimit} of the most recent commits for this branch.</span>`
                        : `
                <div class="connection neon">
                    <span></span>
                    <span></span>
                </div>
                `
                }
            `;

            this.#graph.insertAdjacentHTML("beforeend", commitCard);
        });

        notifications.notify("The graph has been successfully generated", "success");
    }

    #bindEvents() {
        if (this.#eventsController) this.#eventsController.abort();
        this.#eventsController = new AbortController();
        const { signal } = this.#eventsController;

        this.#graph.addEventListener(
            "click",
            async (e) => {
                const commitButton = e.target.closest("[data-id]");
                if (!commitButton) return;

                const { sha } = commitButton.dataset;
                const commit = this.#data?.commitsDetails.find((item) => item.sha === sha);
                if (!commit) return;
                const requestId = this.#requestId;

                generateLoader();

                try {
                    const filesData = await this.#getFilesData(sha);

                    if (requestId !== this.#requestId || !commitButton.isConnected) return;

                    const modal = generateFullCommitModalHTML(commit, filesData);
                    if (!modal) return;

                    appendHTML(modal);
                    bindFullComitEvents(commitButton);
                } finally {
                    if (requestId === this.#requestId) removeLoader();
                }
            },
            { signal },
        );

        this.#graph.addEventListener(
            "mouseover",
            (e) => {
                const commitButton = e.target.closest("[data-id]");
                if (!commitButton) return;

                const { sha } = commitButton.dataset;
                const commit = this.#data?.commitsDetails.find((item) => item.sha === sha);

                const modal = generateHoverCommitModalHTML(commit);

                if (!modal) return;

                appendHTML(modal);

                const modalDOM = this.#body.querySelector("#hover-commit-modal");

                if (modal) {
                    positionModalNearElement(modalDOM, commitButton);
                }
            },
            { signal },
        );

        this.#graph.addEventListener("mouseout", () => closeHoverCommitModals(), { signal });
    }
}

const graph = new GraphController(DOM.graph);
dropDown.setOnSelect((branch) => graph.renderByBranch(branch));

if (storage.link) {
    graph.render();
}

export { GraphController };
export default graph;
