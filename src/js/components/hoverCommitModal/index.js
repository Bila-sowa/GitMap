import { truncateTitle } from "@/js/utils/utils";
import styles from "./styles.module.scss";

const closeHoverCommitModals = () => {
    [...document.querySelectorAll(".hover-commit-modal")]?.forEach((modal) => modal.remove());
};

const generateHoverCommitModalHTML = (commitData) => {
    if (!commitData) return;

    const {
        title,
        author: { email: authorEmail, name: authorName, avatar: authorAvatar, date: authorDate },
        hash,
    } = commitData;

    closeHoverCommitModals();

    const shortDate = authorDate
        .split(",")[0]
        .trim()
        .split(".")
        .map((part, i) => (i === 2 ? part.slice(-2) : part))
        .join(".");

    const formattedTitle = truncateTitle(title, 12);

    return `
        <div class="${styles.modal} hover-commit-modal" id="hover-commit-modal" role="dialog">
            <h3>${formattedTitle}</h3>
            <div class="${styles["modal-hr"]}"></div>
            <div class="${styles["modal-content"]}">
                <div class="${styles["modal-data"]}">
                    <div class="${styles["modal-item"]} rounded-normal" style="display: flex; align-items: center; gap: 10px;" title="Email: ${authorEmail}">
                        <span>Author: </span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span>${authorName}</span>
                            <img class="avatar rounded-full" src="${authorAvatar}" alt="${authorName} avatar">
                        </div>
                    </div>
                    <div class="${styles["modal-item"]} rounded-normal">
                        <span>Hash: </span>
                        <span>#${hash}</span>
                    </div>
                    <div class="${styles["modal-item"]} rounded-normal">
                        <span>Date: </span>
                        <span>${shortDate}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export { generateHoverCommitModalHTML, closeHoverCommitModals };
