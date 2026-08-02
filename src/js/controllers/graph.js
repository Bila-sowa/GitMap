import GitHubClient from "../services/getGitHubData.js";

export default class Graph {
    #graph;
    #client;
    #data;
    #cooldown;
    #isOpen;
    #hoverTimeoutId = null;

    constructor(graphElement) {
        this.#graph = graphElement;
        this.#cooldown = 1500;
        this.#bindEvents();
    }

    async render(link) {
        if (!link) return;

        await this.#getData(link);
        this.#graph.innerHTML = '';

        this.#data.commitsDetails.forEach((commit, index) => {
            const formattedTitle = commit.message.split('\n')[0];
            const isLast = index === this.#data.commitsDetails.length - 1;

            const commitCard = `
                <button class="commit" data-id="${index}" aria-label="Open commit ${formattedTitle}" title="Open commit ${formattedTitle}"></button>
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
        this.#graph.addEventListener('click', this.#handleCommitClick);
        this.#graph.addEventListener('mouseover', this.#handleCommitHover);
        this.#graph.addEventListener('mouseout', this.#handleCommitLeave);
    }

    async #getData(link) {
        this.#client = new GitHubClient(link);
        this.#data = await this.#client.getData();
    }

    #handleCommitClick = (e) => {
        const commitButton = e.target.closest('.commit');
        if (!commitButton) return;

        const commitIndex = +commitButton.dataset.id;
        this.#openFullCommitModal(commitIndex);
    };

    #handleCommitHover = (e) => {
        const commitButton = e.target.closest('.commit');
        if (!commitButton || this.#isOpen) return;

        const commitIndex = +commitButton.dataset.id;

        this.#hoverTimeoutId = setTimeout(() => {
            this.#openHoverCommitModal(commitIndex);
            this.#hoverTimeoutId = null;
        }, this.#cooldown);
    };

    #handleCommitLeave = (e) => {
        const commitButton = e.target.closest('.commit');
        if (!commitButton) return;

        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        if (this.#isOpen) {
            this.#closeCommitModal();
        }
    };

    #openFullCommitModal = (commitIndex) => {
        const commit = this.#data?.commitsDetails[commitIndex];
        if (!commit || this.#isOpen) return;

        this.#isOpen = true;
    }

    #openHoverCommitModal = (commitIndex) => {
        const commit = this.#data?.commitsDetails[commitIndex];
        if (!commit || this.#isOpen) return;

        this.#isOpen = true;
    }

    #closeCommitModal = () => {
        this.#isOpen = false;
    }
}
