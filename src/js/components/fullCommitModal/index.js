import { copyValueToClipboard } from "@/js/utils/utils.js";
import styles from "./styles.module.scss";
import gitHubLogoSrc from "@/assets/github-logo.webp"

const getTheme = () => {
    return document.body.classList.contains("dark-theme") ? "dark" : "light";
}

const closeFullCommitModals = () => {
    [...document.querySelectorAll(".full-commit-modal")].forEach(modal => modal.remove());
};

const statusColors = {
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

const generateFullCommitModalHTML = (commitData, filesData) => {
    if (!commitData || !filesData) return;

    const {
        title,
        description = "",
        author: {
            url: authorUrl,
            email: authorEmail,
            name: authorName,
            avatar: authorAvatar,
            date: authorDate
        },
        hash,
        url: commitUrl
    } = commitData;

    const { success, files } = filesData;

    closeFullCommitModals();

    const parsedDescription = typeof marked !== "undefined" ? marked.parse(description) : description;
    const theme = getTheme();

    return `
        <div class="full-commit-modal ${styles.modal}" id="full-commit-modal" role="dialog">
        <div class="${styles['modal-header']}">
            <h2>${title}</h2>
            <button class="close-button rounded-full" id="close-full-commit-button" aria-label="Close">&times;</button>
        </div>
        <p>Description:</p>
        <div class="${styles['modal-description']}">
            ${parsedDescription ? parsedDescription : ""} 
        </div>
        <div class="${styles['modal-data']}">
            <a class="${styles['modal-item']} rounded-normal" href="${authorUrl}" target="_blank" rel="noopener noreferrer" title="Email: ${authorEmail}">
                <span>Author: </span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${authorName} 
                    <img class="avatar rounded-full" src="${authorAvatar}" alt="${authorName}'s Avatar">
                </div>
            </a>
            <button class="${styles["modal-item"]} rounded-normal copyable" data-copy-value="${hash}" aria-label="Copy commit hash to clipboard">
                <span>Hash: </span>
                <span>#${hash}</span>
            </button>
            <button class="${styles["modal-item"]} rounded-normal copyable" data-copy-value="${authorDate}" aria-label="Copy commit date to clipboard">
                <span>Date: </span>
                <span>${authorDate}</span>
            </button>
        </div>
        <div class="${styles['modal-changes']}">
            <h3>Changes</h3>
            <div class="${styles['modal-files']}">
                ${success && Array.isArray(files) ? files.map(file => `
                    <div class="${styles['modal-file']} rounded-normal">
                        <img class="${styles['modal-file-icon']}" style="color: white;" src="https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/${file.extension}.svg" alt>
                        <code class="${styles["modal-file-path"]} text-small">${file.name}</code>
                        <div class="${styles['modal-file-changes']}">
                            ${file.status === "R" ? `<span class="text-small" style="color: ${statusColors[`${theme}`][file.fullStatus]}" title="${file.fullStatus}">${file.status}</span>` : `
                                <code class="${styles['modal-file-changes-additions']} text-small">+${file.additions}</code>
                                <code class="${styles['modal-file-changes-deletions']} text-small">-${file.deletions}</code>
                                <code class="text-small" style="color: ${statusColors?.[`${theme}`][file.fullStatus] ?? "#8B949E"}" title="${file.fullStatus}">${file.status}</code>
                            `}
                        </div>
                    </div>
                `).join("") : `<p class="text-small">No files details available.</p>`}
            </div>
            <a href="${commitUrl}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b><img width="32" src="${gitHubLogoSrc}" alt></a>
        </div>
    </div>
    `;
}

function bindFullComitEvents() {
    const modal = document.querySelector("#full-commit-modal");
    if (!modal) return;

    const controller = new AbortController();
    const { signal } = controller;

    const closeButton = modal.querySelector("#close-full-commit-button");
    const icons = [...modal.querySelectorAll(".file-icon")];
    const copyableItems = [...modal.querySelectorAll(".copyable")];
    const theme = getTheme();

    icons.forEach(icon => {
        icon.addEventListener("error", () => {
            icon.onerror = null;
            icon.src = `https://raw.githubusercontent.com/Bila-sowa/file-extension-icons/main/icons-${theme}/file.svg`;
        }, { signal });
    });

    copyableItems.forEach(item => {
        item.addEventListener("click", () => copyValueToClipboard(item), { signal });
    });

    closeButton?.focus();

    const cleanup = () => {
        controller.abort();
        closeFullCommitModals();
    };

    closeButton?.addEventListener("click", cleanup, { signal });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            cleanup();
        }
    }, { signal });
}

export { generateFullCommitModalHTML, bindFullComitEvents }
