import notifications from "./notificationManager";

const modalPositioning = new WeakMap();

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

function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
    return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function positionModalNearElement(modal, trigger, offset = 16) {
    if (!modal || !trigger) return;

    modalPositioning.get(modal)?.abort();
    const controller = new AbortController();
    modalPositioning.set(modal, controller);

    modal.style.position = "fixed";
    modal.style.maxWidth = `calc(100vw - ${offset * 2}px)`;

    const position = () => {
        if (!modal.isConnected || !trigger.isConnected) return;

        const triggerRect = trigger.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const maxLeft = Math.max(offset, viewportWidth - modalRect.width - offset);
        const right = triggerRect.right + offset;
        const left = triggerRect.left - modalRect.width - offset;
        const preferredLeft = right + modalRect.width <= viewportWidth - offset ? right : left >= offset ? left : right;
        const maxTop = Math.max(offset, viewportHeight - modalRect.height - offset);
        const clampedLeft = Math.min(Math.max(preferredLeft, offset), maxLeft);
        const clampedTop = Math.min(Math.max(triggerRect.top, offset), maxTop);

        modal.style.top = `${clampedTop}px`;
        modal.style.left = `${clampedLeft}px`;
    };

    position();
    window.addEventListener("resize", position, { signal: controller.signal });
    window.addEventListener("scroll", position, { capture: true, signal: controller.signal });

    if (typeof ResizeObserver === "function") {
        const observer = new ResizeObserver(position);
        observer.observe(modal);
        observer.observe(trigger);
        controller.signal.addEventListener("abort", () => observer.disconnect(), { once: true });
    }
}

function stopModalPositioning(modal) {
    modalPositioning.get(modal)?.abort();
    modalPositioning.delete(modal);
}

const truncateTitle = (title, wordCount = 5) => {
    if (typeof title !== "string" || !title.trim()) return "";

    const validWordCount = Number.isInteger(wordCount) && wordCount > 0 ? wordCount : 5;
    const words = title.trim().split(/\s+/);
    return words.length > validWordCount ? words.slice(0, validWordCount).join(" ") + "..." : title;
};

function appendHTML(HTML) {
    const body = document.body;

    if (!HTML | !body) return;

    body.insertAdjacentHTML("beforeend", HTML);
}

export {
    copyValueToClipboard,
    getRandomID,
    escapeHTML,
    isRecord,
    isNonEmptyString,
    isValidDate,
    positionModalNearElement,
    stopModalPositioning,
    truncateTitle,
    appendHTML,
};
