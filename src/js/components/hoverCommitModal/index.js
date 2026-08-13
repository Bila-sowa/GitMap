import { truncateTitle } from "@/js/utils/utils";
import styles from "./styles.module.scss";

const closeHoverCommitModals = () => {
    [...document.querySelectorAll(".hover-commit-modal")]?.forEach(modal => modal.remove());
}

const generateHoverCommitModalHTML = (commitData) => {
    if (!commitData) return;

    closeHoverCommitModals();

    const shortDate = commitData.author.date
        .split(",")[0]
        .trim()
        .split(".")
        .map((part, i) => (i === 2 ? part.slice(-2) : part))
        .join(".");

    const formattedTitle = truncateTitle(commitData.title, 12);


    return `
        <div class="${styles.modal} hover-commit-modal" id="hover-commit-modal" role="dialog">
            <h3>${formattedTitle}</h3>
            <div class="${styles['modal-hr']}"></div>
            <div class="${styles['modal-content']}">
                <div class="${styles['modal-data']}">
                    <div class="${styles['modal-item']} rounded-normal" style="display: flex; align-items: center; gap: 10px;" title="Email: ${commitData.author.email}">
                        <span>Author: </span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span>${commitData.author.name}</span>
                            <img class="avatar rounded-full" src="${commitData.author.avatar}" alt="${commitData.author.name} avatar">
                        </div>
                    </div>
                    <div class="${styles['modal-item']} rounded-normal">
                        <span>Hash: </span>
                        <span>#${commitData.hash}</span>
                    </div>
                    <div class="${styles['modal-item']} rounded-normal">
                        <span>Date: </span>
                        <span>${shortDate}</span>
                    </div>
                </div>
            </div>
        </div>
    `
}


export { generateHoverCommitModalHTML, closeHoverCommitModals }
