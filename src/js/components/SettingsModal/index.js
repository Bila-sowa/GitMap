import storage from "@/js/data/storage";
import LocalStorage from "@/js/controllers/localStorage";
import styles from "./styles.module.scss";

const generateSettingsModalHTML = (limit, versionDetails) => {
    const { usedPerNumber, limitPerNumber, usedPerPercent } = limit;

    const tokenActiveMessage = "The token is active, now your limit is 5000 requests per hour.";
    const tokenNonActiveMessage = "The token is not active, your limit is 60 requests per hour.";
    const notStableMessage =
        "This version provides no guarantees regarding your security and the program's operability.";

    let authenticated = false;

    // Basic token limit with authorization.
    if (limitPerNumber >= 5000) authenticated = true;

    const { version, versionType, versionIsStable } = versionDetails;

    return `
        <div class="overlay">
            <div class="${styles.settings}" id="settings-content" role="dialog">
                <div class="${styles["settings-header"]}">
                    <h1>Settings</h1>
                    <button class="close-button rounded-full" id="close-settings-button">&times;</button>
                </div>
                <div class="${styles["settings-content"]}">
                    <div class="${styles["settings-section"]}">
                        <h3>GitHub</h3>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <label for="token-input">GitHub rest api token</label>
                            <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" value="${storage.token || ""}" placeholder="gpy_">
                        </div>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span>GitHub Rest api token status:</span>
                            <span class="
                                ${authenticated ? "active-color" : "non-active-color"} 
                                ${styles["settings-token-status"]} rounded-full"
                                title="${authenticated ? tokenActiveMessage : tokenNonActiveMessage}"
                            >
                                ${authenticated ? "Active" : "Non-active"}
                            </span>
                        </div>
                    </div>
                    <div class="${styles["settings-section"]}"> 
                        <h3>LocalStorage</h3>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span for="save-link">Save current repo in page</span>
                            <input class="hidden ${styles["settings-toggle-input"]}" type="checkbox" id="save-link">
                            <label class="${styles["settings-toggle-button"]} rounded-full" for="save-link" aria-label="toggle save link option"></label>
                        </div>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span>Save current token in page</span>
                            <input class="hidden ${styles["settings-toggle-input"]}" type="checkbox" id="save-token">
                            <label class="${styles["settings-toggle-button"]} rounded-full" for="save-token" aria-label="toggle save token option"></label>
                        </div>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span>Rest API Limit:</span>
                            <div 
                                class="${styles["settings-rest-api-limit-progress"]} 
                                rounded-full border-normal" 
                                title="Used: ${usedPerNumber} / ${limitPerNumber}"
                            >
                                <span 
                                    class="${styles["settings-rest-api-limit-bar"]}" 
                                    style="width: ${usedPerPercent}%"></span>
                            </div>
                        </div>
                    </div>
                    <div class="${styles["settings-version-text-container"]}">
                        <span class="text-small">Version: </span>
                        <span class="text-small">${versionType}</span>
                        <a class="text-small link" href="#" target="_blank" class="bg-none" title="View in changelog" class="text-small">${version}</a>
                        ${versionIsStable ? "" : `<span title="${notStableMessage}" class="text-small cursor-help">${versionIsStable ? "" : "(not stable)"}</span>`}
                    </div> 
                </div>
            </div>
        </div>
    `;
};

function bindSettingsModalEvents() {
    const modal = document.querySelector(".overlay");
    const modalContent = document.querySelector("#settings-content");

    if (!modal || !modalContent) return;

    const controller = new AbortController();
    const { signal } = controller;

    const closeButton = modal.querySelector("#close-settings-button");
    const tokenInput = modal.querySelector("#token-input");
    const saveLinkToggle = document.querySelector("#save-link");
    const saveTokenToggle = document.querySelector("#save-token");
    const localStorage = new LocalStorage();

    function saveToken() {
        storage.token = tokenInput.value.trim();
        if (storage.saveToken) {
            localStorage.save();
        }
    }

    function closeModal() {
        controller.abort();
        modal.remove();
    }

    function handleOutsideClick(e) {
        if (e.target === modal) {
            closeModal();
        }
    }

    function handleEscapeKey(e) {
        if (e.code === "Escape") {
            closeModal();
        }
    }

    function toggleSaveLink() {
        storage.saveLink = saveLinkToggle.checked;
        localStorage.save();
    }

    function toggleSaveToken() {
        storage.saveToken = saveTokenToggle.checked;
        localStorage.save();
    }

    tokenInput.addEventListener("blur", saveToken, { signal });
    closeButton.addEventListener("click", closeModal, { signal });
    document.addEventListener("click", handleOutsideClick, { signal });
    document.addEventListener("keydown", handleEscapeKey, { signal });

    saveLinkToggle.checked = storage.saveLink;
    saveLinkToggle.addEventListener("change", toggleSaveLink, { signal });

    saveTokenToggle.checked = storage.saveToken;
    saveTokenToggle.addEventListener("change", toggleSaveToken, { signal });
}

export { generateSettingsModalHTML, bindSettingsModalEvents };
