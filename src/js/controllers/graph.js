import storage from "../data/storage.js";
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

    #statusColors = {
        light: {
            added: "#2DA44E",
            modified: "#BF8700",
            removed: "#CF222E",
            renamed: "#0969DA",
            copied: "#8250DF",
            changed: "#656D76"
        },
        dark: {
            added: "#3FB950",
            modified: "#D29922",
            removed: "#F85149",
            renamed: "#58A6FF",
            copied: "#A371F7",
            changed: "#8B949E"
        }
    };

    constructor(graphElement) {
        this.#body = document.querySelector("body")
        this.#graph = graphElement;
        this.#bindEvents();
    }

    async render() {
        if (!storage.link) return;

        await this.#getData(storage.link);
        this.#graph.innerHTML = '';

        this.#data.commitsDetails.forEach((commit, index) => {
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

    #bindEvents() {
        this.#graph.addEventListener('click', this.#openFullCommitModal);
        this.#graph.addEventListener('mouseover', this.#openHoverCommitModal);
        this.#graph.addEventListener('mouseout', this.#closeHoverCommitModal);
    }

    async #getData(link) {
        this.#client = new GitHubClient(link);
        this.#data = await this.#client.getData();
    }


    #truncateTitle(title) {
        const words = title.trim().split(/\s+/);
        return words.length > 5 ? words.slice(0, 3).join(" ") + "..." : title;
    }

    #getTheme() {
        return this.#body.classList.contains("dark-theme") ? "dark" : "light";
    }

    #clearHoverTimeout() {
        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }
    }

    #closeHoverModal() {
        this.#clearHoverTimeout();
        document.querySelector("#hover-commit-modal")?.remove();
        this.#isHoverOpen = false;
    }

    #closeFullModal() {
        document.querySelector("#full-modal-window")?.remove();
        this.#lastFocusedCommit?.setAttribute("aria-expanded", "false");

        if (this.#keydownHandler) {
            document.removeEventListener("keydown", this.#keydownHandler);
            this.#keydownHandler = null;
        }
    }


    #openFullCommitModal = async (e) => {
        const commitButton = e.target.closest('.commit');
        const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];

        if (!commit) return;

        this.#closeHoverModal();
        this.#closeFullModal();

        const files = await this.#client.getCommitFiles(commit.sha);
        const theme = this.#getTheme();
        const colors = this.#statusColors[theme];

        const card = `
            <div class="full-commit-modal" id="full-modal-window" role="dialog">
                <div class="full-commit-header">
                    <h2>${commit.title}</h2>
                    <button class="close-button rounded-full" id="close-button" aria-label="Close">&times;</button>
                </div>
                <p>${commit.description ? "Description: " + commit.description : ""} </p>
                <div class="full-commit-data">
                    <a class="full-commit-item rounded-normal " href="${commit.author.url}" target="_blank" rel="noopener noreferrer" title="Email: ${commit.author.email}">
                        <span>Author: </span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${commit.author.name} 
                            <img class="avatar rounded-full" src="${commit.author.avatar}" alt="${commit.author}'s Avatar">
                        </div>
                    </a>
                    <button class="full-commit-item rounded-normal copyable" data-copy-value="${commit.hash}" aria-label="Copy commit hash to clipboard">
                        <span>Hash: </span>
                        <span>#${commit.hash}</span>
                    </button>
                    <button class="full-commit-item rounded-normal copyable" data-copy-value="${commit.author.date}" aria-label="Copy commit date to clipboard">
                        <span>Date: </span>
                        <span>${commit.author.date}</span>
                    </button>
                </div>
                <div class="full-commit-changes">
                    <h3>Changes</h3>
                    <div class="full-commit-files">
                        ${files.success ? files.files.map(file => `
                            <div class="full-commit-file rounded-normal">
                                <img style="color: white;" src="https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/${file.extension}.svg" alt>
                                <code class="full-commit-file-name text-small">${file.name}</code>
                                <div class="full-commit-file-changes">
                                    ${file.status === "R" ? `<span style="color: ${colors[file.fullStatus]}" title="${file.fullStatus}">${file.status}</span>` : 
                                        `
                                        <code class="file-additions text-small">+${file.additions}</code>
                                        <code class="file-deletions text-small">-${file.deletions}</code>
                                        <code class="text-small" style="color: ${colors?.[file.fullStatus] ?? "#8B949E"}" title="${file.fullStatus}">${file.status}</code>
                                        `
                                    }
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
        const icons = [...document.querySelectorAll(".file-icon")];
        const copyableItems = [...modal.querySelectorAll(".copyable")];
        const COOLDOWN = 1500;

        // renderIcons(array)

        icons.forEach(icon => {
            icon.addEventListener("error", () => {
                icon.onerror = null;
                icon.src = `https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/file.svg`;
            });
        });

        const copyValueToClipboard = async (element) => {
            const value = element.dataset.copyValue;
            if (!value) return;

            try {
                await navigator.clipboard.writeText(value); // Don't work in http, and local host.
                element.classList.add("copied");
                setTimeout(() => element.classList.remove("copied"), COOLDOWN);
                // showSuccess
            } catch (err) {
                console.log(err);
                // showError
            }
        };

        copyableItems.forEach(item => { item.addEventListener("click", () => copyValueToClipboard(item)); });

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

        const shortDate = commit.author.date.split(",")[0].trim().split(".").map((part, i, arr) => i === 2 ? part.slice(-2) : part).join(".");

        this.#clearHoverTimeout();

        this.#hoverTimeoutId = setTimeout(() => {
            this.#hoverTimeoutId = null;
            if (this.#isFullOpen) return;
            this.#isHoverOpen = true;

            const card = `
                <div class="hover-commit-modal" id="hover-commit-modal" role="dialog">
                    <h3>${commit.title}</h3>
                    <div class="hover-commit-body">
                        <div class="hover-commit-data">
                            <div class="hover-commit-item rounded-normal" style="display: flex; align-items: center; gap: 10px;" title="Email: ${commit.author.email}">
                                <span class="text-small">Author: </span>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span class="text-small">${commit.author.name}</span>
                                    <img class="avatar rounded-full" src="${commit.author.avatar}" alt="${commit.author.name} avatar">
                                </div>
                            </div>
                            <div class="hover-commit-item rounded-normal">
                                <span class="text-small">Hash: </span>
                                <span class="text-small">#${commit.hash}</span>
                            </div>
                            <div class="hover-commit-item rounded-normal">
                                <span class="text-small">Date: </span>
                                <span class="text-small">${shortDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            commitButton.insertAdjacentHTML("beforeend", card);
        }, this.#delay);
    }

    #closeHoverCommitModal = () => {
        this.#closeHoverModal();
    }
}
