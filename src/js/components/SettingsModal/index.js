import storage from "@/js/data/storage";
import localStorage from "@/js/controllers/localStorage";
import styles from "./styles.module.scss";
import gitHubClient from "@/js/api/gitHubClient";

const tokenStatusDetails = {
    checking: {
        label: "Checking",
        title: "Checking whether the GitHub token is valid.",
    },
    valid: {
        label: "Active",
        title: "The token is active, now your limit is 5000 requests per hour.",
    },
    invalid: {
        label: "Invalid",
        title: "The token was rejected by GitHub.",
    },
    unavailable: {
        label: "Unavailable",
        title: "GitHub token status could not be checked.",
    },
    "no-token": {
        label: "No token",
        title: "No GitHub token is configured, so the limit is 60 requests per hour.",
    },
};

function getTokenStatusState(tokenResult, hasToken) {
    if (!hasToken) return "no-token";
    if (tokenResult?.success) return "valid";
    if (tokenResult?.devError?.status === 401) return "invalid";

    return "unavailable";
}

function getRateLimitData(rateLimitResponse) {
    const rateLimit = rateLimitResponse?.data || {};
    const limitPerNumber = Number.isFinite(rateLimit.limitPerNumber) ? rateLimit.limitPerNumber : 0;
    const usedPerNumber = Number.isFinite(rateLimit.usedPerNumber) ? rateLimit.usedPerNumber : 0;
    const usedPerPercent = Number.isFinite(rateLimit.usedPerPercent)
        ? Math.min(Math.max(rateLimit.usedPerPercent, 0), 100)
        : 0;

    return { limitPerNumber, usedPerNumber, usedPerPercent };
}

function renderTokenStatus(modal, tokenState) {
    const status = modal.querySelector("#token-status");
    const details = tokenStatusDetails[tokenState] || tokenStatusDetails.unavailable;

    if (!status) return;

    status.textContent = details.label;
    status.title = details.title;
    status.classList.toggle("active-color", tokenState === "valid");
    status.classList.toggle("non-active-color", tokenState !== "valid");
    status.setAttribute("aria-busy", String(tokenState === "checking"));
}

function renderRateLimitProgressBar(modal, rateLimitResponse) {
    const progress = modal.querySelector("#settings-rest-api-limit-progress");
    const bar = modal.querySelector("#settings-rest-api-limit-bar");

    if (!progress || !bar) return;

    if (!rateLimitResponse?.success) {
        const title = "Rate limit data is unavailable.";

        bar.style.width = "0%";
        progress.title = title;
        progress.setAttribute("aria-label", title);
        progress.removeAttribute("aria-valuenow");
        return;
    }

    const { usedPerNumber, limitPerNumber, usedPerPercent } = getRateLimitData(rateLimitResponse);
    const title = `Used: ${usedPerNumber} / ${limitPerNumber}`;

    bar.style.width = `${usedPerPercent}%`;
    progress.title = title;
    progress.setAttribute("aria-label", title);
    progress.setAttribute("aria-valuenow", String(usedPerPercent));
}

const generateSettingsModalHTML = (rateLimitResponse, tokenState, versionDetails) => {
    const { usedPerNumber, limitPerNumber, usedPerPercent } = getRateLimitData(rateLimitResponse);
    const tokenStatus = tokenStatusDetails[tokenState] || tokenStatusDetails.unavailable;
    const rateLimitAvailable = rateLimitResponse?.success;

    const notStableMessage =
        "This version provides no guarantees regarding your security and the program's operability.";

    const { version, versionIsStable } = versionDetails;

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
                            <span id="token-status" class="
                                ${tokenState === "valid" ? "active-color" : "non-active-color"}
                                ${styles["settings-token-status"]} rounded-full"
                                title="${tokenStatus.title}"
                                aria-live="polite"
                                aria-busy="${tokenState === "checking"}"
                            >
                                ${tokenStatus.label}
                            </span>
                        </div>
                    </div>
                    <div class="${styles["settings-section"]}">
                        <h3>LocalStorage</h3>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span id="save-link-label">Save current repo in page</span>
                            <input class="visually-hidden ${styles["settings-toggle-input"]}" type="checkbox" id="save-link" aria-labelledby="save-link-label">
                            <label class="${styles["settings-toggle-button"]} rounded-full" for="save-link"></label>
                        </div>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span id="save-token-label">Save current token in page</span>
                            <input class="visually-hidden ${styles["settings-toggle-input"]}" type="checkbox" id="save-token" aria-labelledby="save-token-label">
                            <label class="${styles["settings-toggle-button"]} rounded-full" for="save-token"></label>
                        </div>
                        <div class="${styles["settings-item"]} rounded-normal border-sm">
                            <span>Rest API Limit:</span>
                            <div
                                id="settings-rest-api-limit-progress"
                                class="${styles["settings-rest-api-limit-progress"]}
                                rounded-full border-normal"
                                title="${rateLimitAvailable ? `Used: ${usedPerNumber} / ${limitPerNumber}` : "Rate limit data is unavailable."}"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                ${rateLimitAvailable ? `aria-valuenow="${usedPerPercent}"` : ""}
                                aria-label="${rateLimitAvailable ? `Used: ${usedPerNumber} / ${limitPerNumber}` : "Rate limit data is unavailable."}"
                            >
                                <span id="settings-rest-api-limit-bar"
                                    class="${styles["settings-rest-api-limit-bar"]}"
                                    style="width: ${rateLimitAvailable ? usedPerPercent : 0}%"></span>
                            </div>
                        </div>
                    </div>
                    <div class="${styles["settings-version-text-container"]}">
                        <span class="text-small">Version: </span>
                        <a class="text-small link is-disabled" href="#" target="_blank" title="View in changelog" class="text-small" aria-disabled="true">${version}</a>
                        ${versionIsStable ? "" : `<span title="${notStableMessage}" class="text-small cursor-help">${versionIsStable ? "" : "(not stable)"}</span>`}
                    </div>
                </div>
            </div>
        </div>
    `;
};

function getSettingsModal() {
    return document.querySelector("#settings-content")?.closest(".overlay");
}

function bindSettingsModalEvents(modal = getSettingsModal(), onClose) {
    const modalContent = modal?.querySelector("#settings-content");

    if (!modal || !modalContent) return;

    const controller = new AbortController();
    const { signal } = controller;

    const closeButton = modal.querySelector("#close-settings-button");
    const tokenInput = modal.querySelector("#token-input");
    const saveLinkToggle = modal.querySelector("#save-link");
    const saveTokenToggle = modal.querySelector("#save-token");
    async function saveToken() {
        const token = tokenInput.value.trim();

        renderTokenStatus(modal, "checking");

        const result = await gitHubClient.setToken(token);

        if (signal.aborted || result.cancelled) return;

        const tokenState = getTokenStatusState(result, Boolean(token));
        renderTokenStatus(modal, tokenState);

        if (result.success && storage.saveToken) {
            localStorage.save();
        }

        const rateLimitResponse = await gitHubClient.getRateLimitData({ signal });

        if (!signal.aborted && !rateLimitResponse.cancelled) {
            renderRateLimitProgressBar(modal, rateLimitResponse);
        }
    }

    function closeModal() {
        if (signal.aborted) return;

        controller.abort();
        modal.remove();
        onClose?.();
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

export { generateSettingsModalHTML, bindSettingsModalEvents, getTokenStatusState, renderRateLimitProgressBar };
