import { copyValueToClipboard } from "@/js/utils/utils.js";

export default class FullCommitModal {
    #state = null;

    constructor(state) {
        this.#state = state;
    }

    bindEvents() {
        this.#state.graph.addEventListener("click", this.#openFullCommitModal);
    }

    #generateHTML = (commit, files) => {
        const theme = this.#state.getTheme();
        const colors = this.#state.getStatusColors();
        const parsedDescription = typeof marked !== "undefined" ? marked.parse(commit.description || "") : commit.description;

        return `
            <div class="full-commit" id="full-commit-modal" role="dialog">
                <div class="full-commit-header">
                    <h2>${commit.title}</h2>
                    <button class="close-button rounded-full" id="close-button" aria-label="Close">&times;</button>
                </div>
                <p>Description:</p>
                <div class="full-commit-description">
                    ${parsedDescription ? parsedDescription : ""} 
                </div>
                <div class="full-commit-data">
                    <a class="full-commit-item rounded-normal" href="${commit.author.url}" target="_blank" rel="noopener noreferrer" title="Email: ${commit.author.email}">
                        <span>Author: </span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${commit.author.name} 
                            <img class="avatar rounded-full" src="${commit.author.avatar}" alt="${commit.author.name}'s Avatar">
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
                        ${files?.success && Array.isArray(files.files) ? files.files.map(file => `
                            <div class="full-commit-file rounded-normal">
                                <img class="file-icon" style="color: white;" src="https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/${file.extension}.svg" alt>
                                <code class="full-commit-file-name text-small">${file.name}</code>
                                <div class="full-commit-file-changes">
                                    ${file.status === "R" ? `<span class="text-small" style="color: ${colors[file.fullStatus]}" title="${file.fullStatus}">${file.status}</span>` : `
                                        <code class="file-additions text-small">+${file.additions}</code>
                                        <code class="file-deletions text-small">-${file.deletions}</code>
                                        <code class="text-small" style="color: ${colors?.[file.fullStatus] ?? "#8B949E"}" title="${file.fullStatus}">${file.status}</code>
                                    `}
                                </div>
                            </div>
                        `).join("") : `<p class="text-small">No files details available.</p>`}
                    </div>
                    <a href="${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b><img width="32" src="/src/assets/github_logo.webp" alt></a>
                </div>
            </div>
        `;
    };

    #openFullCommitModal = async (e) => {
        const commitButton = e.target.closest(".commit");
        if (!commitButton) return;

        const data = this.#state.getData();
        const commitId = commitButton.dataset.id;
        const commit = data?.commitsDetails?.[+commitId];

        if (!commit) return;

        // Address lies on graph, sha lies on each button
        const address = this.#state.graph.dataset.repoUrl || this.#state.getRepoUrl();
        const sha = commitButton.dataset.sha || commit.sha;

        const commitFiles = await this.#state.getCommitFiles(address, sha);

        this.#state.closeHoverModal();
        this.#state.closeFullModal();

        const card = this.#generateHTML(commit, commitFiles);

        this.#state.body.insertAdjacentHTML("beforeend", card);
        this.#state.isFullOpen = true;
        this.#state.lastFocusedCommit = commitButton;
        commitButton.setAttribute("aria-expanded", "true");

        const modal = document.querySelector("#full-commit-modal");
        if (!modal) return;

        const closeButton = modal.querySelector("#close-button");
        const icons = [...modal.querySelectorAll(".file-icon")];
        const copyableItems = [...modal.querySelectorAll(".copyable")];
        const theme = this.#state.getTheme();

        icons.forEach(icon => {
            icon.addEventListener("error", () => {
                icon.onerror = null;
                icon.src = `https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/file.svg`;
            });
        });

        copyableItems.forEach(item => {
            item.addEventListener("click", () => copyValueToClipboard(item));
        });

        closeButton?.focus();

        const closeModal = () => {
            this.#state.closeFullModal();
        };

        this.#state.keydownHandler = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        closeButton?.addEventListener("click", closeModal);
        document.addEventListener("keydown", this.#state.keydownHandler);
    };
}

