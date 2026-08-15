import storage from "@/js/data/storage";
import LocalStorage from "@/js/controllers/localStorage";
import styles from "./styles.module.scss"

const generateSettingsModalHTML = (limit, version) => {
    const {
        usedPerNumber,
        limitPerNumber,
        usedPerPercent,
    } = limit;

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
                            <label for="token-input">GitHub Rest Api Token</label>
                            <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" value="${storage.token || ""}" placeholder="gpy_">
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
                            <div class="${styles["settings-rest-api-limit-progress"]} rounded-full border-normal" title="Used: ${usedPerNumber} / ${limitPerNumber}">
                                <span class="${styles["settings-rest-api-limit-bar"]}" style="width: ${usedPerPercent ? usedPerNumber : "0"}%"></span>
                            </div>
                        </div>
                    </div>
                    <span class="${styles["settings-version-text"]} text-small">Version: ${version ? version : "unknown version"}</span>
                </div>
            </div>
        </div>
    `;
}

function bindSettingsModalEvents() {
    const modal = document.querySelector(".overlay");
    const modalContent = document.querySelector("#settings-content")

    if (!modal || !modalContent) return;

    const closeButton = modal.querySelector("#close-settings-button");
    const tokenInput = modal.querySelector("#token-input");
    const saveLinkToggle = document.querySelector("#save-link");
    const saveTokenToggle = document.querySelector("#save-token");
    const localStorage = new LocalStorage();

    function saveToken() {
        storage.token = tokenInput.value.trim();
        if (storage.localStorage.saveToken) {
            localStorage.save();
        }
    }

    function closeModal() {
        modal.remove();
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
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
        storage.localStorage.saveLink = saveLinkToggle.checked;
        localStorage.save();
    }

    function toggleSaveToken() {
        storage.localStorage.saveToken = saveTokenToggle.checked;
        localStorage.save();
    }

    tokenInput.addEventListener("blur", saveToken);
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    saveLinkToggle.checked = storage.localStorage.saveLink;
    saveLinkToggle.addEventListener("change", toggleSaveLink);

    saveTokenToggle.checked = storage.localStorage.saveToken;
    saveTokenToggle.addEventListener("change", toggleSaveToken);
}

export { generateSettingsModalHTML, bindSettingsModalEvents }
