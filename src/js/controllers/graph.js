import GitHubClient from "../services/getGitHubData.js";

export default class Graph {
    #body = null;
    #graph = null;
    #client = null;
    #data = null;
    #delay = 1500;
    #isFullOpen = false;
    #isHoverOpen = false;
    #hoverTimeoutId = null;
    #lastFocusedCommit = null;
    #keydownHandler = null;

    constructor(graphElement) {
        this.#body = document.querySelector("body")
        this.#graph = graphElement;
        this.#bindEvents();
    }

    async render(link) {
        if (!link) return;

        await this.#getData(link);
        this.#graph.innerHTML = '';

        this.#data.commitsDetails.forEach((commit, index) => {
            const isLast = index === this.#data.commitsDetails.length - 1;

            const commitCard = `
                <button class="commit" data-id="${index}" name="${commit.title}" aria-expanded="false" aria-label="Open commit: ${commit.title}"></button>
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
        this.#graph.addEventListener('mouseout', this.#closeHoverCommitModal);
    }

    async #getData(link) {
        this.#client = new GitHubClient(link);
        this.#data = await this.#client.getData();
    }

    #openFullCommitModal = async (e) => {
        const commitButton = e.target.closest('.commit');
        const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];

        if (!commit) return;

        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        document.querySelector("#hover-commit-modal")?.remove();
        this.#isHoverOpen = false;

        document.querySelector("#full-modal-window")?.remove();
        this.#lastFocusedCommit?.setAttribute("aria-expanded", "false");

        if (this.#keydownHandler) {
            document.removeEventListener("keydown", this.#keydownHandler);
            this.#keydownHandler = null;
        }

        const files = await this.#client.getCommitFiles(commit.sha);
    
        const card = `
            <div class="full-commit-modal" id="full-modal-window" role="dialog">
                <button id="close-button" aria-label="close">&times;</button>
                <h2>${commit.title}</h2>
                <p>${commit.description ? "Description: " + commit.description : ""} </p>
                <div class="data-container">
                    <a href="${commit.author.url}" class="author-container"  target="_blank" rel="noopener noreferrer" title="Email: ${commit.author.email}">Author: ${commit.author.name} <img class="avatar-big" src="${commit.author.avatar}" alt="${commit.author}'s Avatar"></a>
                    <span>Hash: #${commit.hash}</span>
                    <span>Date: ${commit.author.date}</span>
                </div>
                <div class="changes-container">
                    <h3>Changes</h3>
                    <div class="files-container">
                        ${files.success ? files.files.map(file => `
                            <div class="file-container">
                                <img class="file-icon" src="./svg/${file.extension}.svg" alt>
                                <span class="file-name">${file.name}</span>
                                <div class="file-changes">
                                    <span class="file-additions">+${file.additions}</span>
                                    <span class="file-deletions">-${file.deletions}</span>
                                </div>
                            </div>
                            `).join("")
                            : ""
                        }
                    </div>
                    <a href="${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b><img width="32" src="./images/github_logo.webp" alt></a>
                </div>
            </div>
        `;

        commitButton.setAttribute("aria-expanded", "true");
        this.#body.insertAdjacentHTML("beforeend", card);
        this.#isFullOpen = true;
        this.#lastFocusedCommit = commitButton;

        const modal = document.querySelector("#full-modal-window");
        const closeButton = document.querySelector("#close-button");

        closeButton.focus();

        const closeModal = () => {
            modal.remove();
            this.#isFullOpen = false;
            commitButton.setAttribute("aria-expanded", "false");
            commitButton.focus();
            document.removeEventListener("keydown", this.#keydownHandler);
            this.#keydownHandler = null;
        };

        this.#keydownHandler = (e) => {
            if (e.key !== "Escape") return;
            closeModal();
        };

        closeButton.addEventListener("click", closeModal);
        document.addEventListener("keydown", this.#keydownHandler);
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

            const card = `
                <div class="hover-commit-modal" id="hover-commit-modal" role="dialog">
                    <h2>${commit.title}</h2>
                    <div class="hover-commit-body">
                        <div class="hover-commit-meta">
                            <span href="${commit.author.url}" class="author-container" target="_blank" rel="noopener noreferrer" title="Email: ${commit.author.email}">
                                <span>Author: ${commit.author.name}</span>
                                <img class="avatar-small" src="${commit.author.avatar}" alt="${commit.author.name} avatar">
                            </span>
                            <span class="hover-meta-item">Hash: #${commit.hash}</span>
                            <span class="hover-meta-item">Date: ${commit.author.date}</span>
                        </div>
                    </div>
                </div>
            `;

            commitButton.insertAdjacentHTML("beforeend", card);
        }, this.#delay);
    }

    #closeHoverCommitModal = () => {
        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }

        document.querySelector("#hover-commit-modal")?.remove();
        this.#isHoverOpen = false;
    }
}
