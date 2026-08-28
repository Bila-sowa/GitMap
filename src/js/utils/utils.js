import notifications from "./notificationManager";

const copyValueToClipboard = async (element) => {
    const COOLDOWN_MS = 3500;
    const value = element.dataset.copyValue;
    if (!value) return;

    try {
        await navigator.clipboard.writeText(value);
        element.classList.add("copied");
        notifications.notify("Successfully copied", "success");
        setTimeout(() => element.classList.remove("copied"), COOLDOWN_MS);
    } catch {
        notifications.notify(
            "Copying error or copying is not allowed by your browser (especially if you launched the server on live server)",
            "error",
        );
    }
};

function getRandomID(prefix) {
    return `${prefix ? prefix + "-" : ""}${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function positionModalNearElement(modal, trigger, offset = 16) {
    if (!modal || !trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();

    modal.style.position = "fixed";

    const maxTop = window.innerHeight - modalRect.height - offset;
    const clampedTop = Math.min(Math.max(triggerRect.top, offset), Math.max(maxTop, offset));

    modal.style.top = `${clampedTop}px`;
    modal.style.left = `${triggerRect.right + offset}px`;
}

const truncateTitle = (title, wordCount = 5) => {
    if (!title) return;

    const words = title.trim().split(/\s+/);
    return words.length > wordCount ? words.slice(0, 3).join(" ") + "..." : title;
};

function appendHTML(HTML) {
    const body = document.body;

    if (!HTML | !body) return;

    body.insertAdjacentHTML("beforeend", HTML);
}

export { copyValueToClipboard, getRandomID, escapeHTML, positionModalNearElement, truncateTitle, appendHTML };
