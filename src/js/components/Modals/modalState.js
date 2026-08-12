import storage from "@/js/data/storage.js";

export default class ModalState {
    #body = null;
    #graph = null;
    #getData = null;
    #getClient = null;
    #delay = 1500;
    #isFullOpen = false;
    #isHoverOpen = false;
    #hoverTimeoutId = null;
    #lastFocusedCommit = null;
    #keydownHandler = null;

    #statusColors = {
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

    constructor(graphElement, { getData, getClient }) {
        this.#body = document.body;
        this.#graph = graphElement;
        this.#getData = getData;
        this.#getClient = getClient;
    }

    get body() {
        return this.#body;
    }

    get graph() {
        return this.#graph;
    }

    get delay() {
        return this.#delay;
    }

    get isFullOpen() {
        return this.#isFullOpen;
    }

    set isFullOpen(value) {
        this.#isFullOpen = value;
    }

    get isHoverOpen() {
        return this.#isHoverOpen;
    }

    set isHoverOpen(value) {
        this.#isHoverOpen = value;
    }

    get lastFocusedCommit() {
        return this.#lastFocusedCommit;
    }

    set lastFocusedCommit(value) {
        this.#lastFocusedCommit = value;
    }

    get keydownHandler() {
        return this.#keydownHandler;
    }

    set keydownHandler(value) {
        this.#keydownHandler = value;
    }

    getData() {
        return this.#getData?.();
    }

    getClient() {
        return this.#getClient?.();
    }

    getRepoUrl() {
        return this.#graph?.dataset?.repoUrl || storage.link || "";
    }

    async getCommitFiles(address, sha) {
        const repoAddress = address || this.getRepoUrl();
        if (!repoAddress || !sha) return { success: false, files: [] };
        return await this.getClient().getCommitFiles(repoAddress, sha);
    }

    getTheme() {
        return this.#body.classList.contains("dark-theme") ? "dark" : "light";
    }

    getStatusColors() {
        return this.#statusColors[this.getTheme()];
    }

    clearHoverTimeout() {
        if (this.#hoverTimeoutId) {
            clearTimeout(this.#hoverTimeoutId);
            this.#hoverTimeoutId = null;
        }
    }

    setHoverTimeout(callback) {
        this.clearHoverTimeout();
        this.#hoverTimeoutId = setTimeout(() => {
            this.#hoverTimeoutId = null;
            callback();
        }, this.#delay);
    }

    closeHoverModal() {
        this.clearHoverTimeout();
        document.querySelector("#hover-commit-modal")?.remove();
        this.#isHoverOpen = false;
    }

    closeFullModal() {
        document.querySelector("#full-commit-modal")?.remove();
        if (this.#lastFocusedCommit) {
            this.#lastFocusedCommit.setAttribute("aria-expanded", "false");
            this.#lastFocusedCommit = null;
        }

        if (this.#keydownHandler) {
            document.removeEventListener("keydown", this.#keydownHandler);
            this.#keydownHandler = null;
        }
        this.#isFullOpen = false;
    }
}

