import GitHubClient from "../services/getGitHubData.js";

export default class Graph {
    #body;
    #graph;
    #client;
    #data;
    #delay;
    #isFullOpen = false;
    #isHoverOpen = false;
    #hoverTimeoutId = null;

    constructor(graphElement) {
        this.#body = document.querySelector("body")
        this.#graph = graphElement;
        this.#delay = 1500;
        this.#bindEvents();
    }

    async render(link) {
        if (!link) return;

        await this.#getData(link);
        this.#graph.innerHTML = '';

        this.#data.commitsDetails.forEach((commit, index) => {
            const isLast = index === this.#data.commitsDetails.length - 1;

            const commitCard = `
                <button class="commit" data-id="${index}" aria-label="Open commit: ${commit.title}" title="Open commit: ${commit.title}"></button>
                ${isLast ? '' : `
                <div class="connection">
                    <span></span>
                    <span></span>
                </div>
                `}
            `;

            this.#graph.insertAdjacentHTML("beforeend", commitCard);
        });
    }

    #bindEvents() {
        this.#graph.addEventListener('click', this.#openFullCommitModal);
        this.#graph.addEventListener('mouseover', this.#openHoverCommitModal);
        this.#graph.addEventListener('mouseout', this.#closeCommitModal);
    }

    async #getData(link) {
        this.#client = new GitHubClient(link);
        this.#data = await this.#client.getData();
    }

    #openFullCommitModal = (e) => {
        const commitButton = e.target.closest('.commit');
        const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];

        if (!commit || this.#isFullOpen || this.#isHoverOpen) return;

        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        console.log(commit)

        const card = `
            <div class="full-commit-modal">
                <h2>${commit.title}</h2>
                <p>${commit.description ? "Description" + commit.description : ""} </p>
                <div class="data-container">
                    <span title="Email: ${commit.author.email}">Author: ${commit.author.name}</span>
                    <span>Hash: ${commit.hash}</span>
                    <span>Date: ${commit.author.date}</span>
                </div>
                <div class="changes-container">
                    <h3>Changes</h3>
                    <div>

                    </div>
                    <a href="${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b></a>
                </div>
            </div>
        `;

        // this.#body.insertAdjacentHTML("beforeend", card);
        this.#isFullOpen = true;
    }

    #openHoverCommitModal = (e) => {
        const commitButton = e.target.closest('.commit');
        const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];

        if (!commit || this.#isFullOpen || this.#isHoverOpen) return;

        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        this.#hoverTimeoutId = setTimeout(() => {
            this.#hoverTimeoutId = null;

            if (this.#isFullOpen) return;

            this.#isHoverOpen = true;
            console.log(commit)
        }, this.#delay);
    }

    #closeCommitModal = () => {
        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        this.#isHoverOpen = false;
    }
}
