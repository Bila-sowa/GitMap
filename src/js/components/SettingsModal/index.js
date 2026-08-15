import storage from "@/js/data/storage";
import LocalStorage from "@/js/controllers/localStorage";


const generateSettingsModalHTML = (limit, version) => {
    const {
        usedPerNumber,
        limitPerNumber,
        usedPerPercent,
    } = limit;

    return `
        <div class="overlay">
            <div class="settings-modal" id="settings-modal" role="dialog">
                <div class="settings-header">
                    <h1>Settings</h1>
                    <button class="close-button" id="close-settings-button">&times;</button>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h3>GitHub</h3>
                        <div class="settings-item rounded-normal border-sm">
                            <label for="token-input">GitHub Rest Api Token</label>
                            <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" value="${storage.token || ""}" placeholder="gpy_">
                        </div>
                    </div>
                    <div class="settings-section"> 
                        <h3>LocalStorage</h3>
                        <div class="settings-item rounded-normal border-sm">
                            <span for="save-link">Save current repo in page</span>
                            <input class="hidden toggle-input" type="checkbox" id="save-link">
                            <label class="toggle-button rounded-full" for="save-link" aria-label="toggle save link option"></label>
                        </div>
                        <div class="settings-item rounded-normal border-sm">
                            <span>Save current token in page</span>
                            <input class="hidden toggle-input" type="checkbox" id="save-token">
                            <label class="toggle-button rounded-full" for="save-token" aria-label="toggle save token option"></label>
                        </div>
                        <div class="settings-item rounded-normal border-sm">
                            <span>Rest API Limit:</span>
                            <div class="rest-api-limit-progress rounded-full border-normal" title="Used: ${usedPerNumber} / ${limitPerNumber}">
                                <span class="rest-api-limit-bar" style="width: ${usedPerPercent ? usedPerNumber : "0"}%"></span>
                            </div>
                        </div>
                    </div>
                    <span class="version-text text-small">Version: ${version ? version : "unknown version"}</span>
                </div>
            </div>
        </div>
    `;
}

const bindSettingsModal = () => {
    const modal = document.querySelector(".overlay");
    const modalContent = document.querySelector("#settings-content")

    if (!modal || !modalContent) return;

    const closeButton = modal.querySelector("#close-setting-button");
    const tokenInput = modal.querySelector("#token-input");
    const saveLinkToggle = document.querySelector("#save-link");
    const saveTokenToggle = document.querySelector("#save-token");
    const localStorage = new LocalStorage();

    tokenInput.addEventListener("blur", () => {
        storage.token = tokenInput.value.trim();
        if (storage.localStorage.saveToken) {
            localStorage.save();
        };
    });

    closeButton.addEventListener("click", () => {
        modal.remove();
    })

    document.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.remove();
        };
    });

    document.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            modal.remove()
        };
    });

    saveLinkToggle.checked = storage.localStorage.saveLink;
    saveLinkToggle.addEventListener("change", () => {
        storage.localStorage.saveLink = saveLinkToggle.checked;
        localStorage.save();
    });

    saveTokenToggle.checked = storage.localStorage.saveToken;
    saveTokenToggle.addEventListener("change", () => {
        storage.localStorage.saveToken = saveTokenToggle.checked;
        localStorage.save();
    });
}

export { generateSettingsModalHTML, bindSettingsModal }
