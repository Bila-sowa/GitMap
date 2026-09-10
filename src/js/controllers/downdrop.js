class DropDown {
    #trigger;
    #list;
    #label;
    #abortController = null;

    constructor(trigger, list, label) {
        this.#trigger = trigger;
        this.#list = list;
        this.#label = label;
        this.#bindEvents();
    }

    #bindEvents() {
        if (this.#abortController) this.#abortController.abort();
        this.#abortController = new AbortController();
        const { signal } = this.#abortController;

        this.#trigger.addEventListener("click", () => this.#toggle(), { signal });
        this.#list.addEventListener("click", (e) => this.#onItemClick(e), { signal });
        this.#list.addEventListener("keydown", (e) => this.#onKeyDown(e), { signal });
        document.addEventListener("click", (e) => this.#onOutsideClick(e), { signal });
    }

    #open() {
        this.#list.classList.remove("hidden");
        this.#trigger.setAttribute("aria-expanded", "true");
    }

    #close() {
        this.#list.classList.add("hidden");
        this.#trigger.setAttribute("aria-expanded", "false");
    }

    #toggle() {
        const isOpen = this.#trigger.getAttribute("aria-expanded") === "true";
        isOpen ? this.#close() : this.#open();
    }

    #selectItem(item) {
        this.#list.querySelectorAll(".branch-dropdown-item").forEach((el) => {
            el.setAttribute("aria-selected", "false");
        });
        item.setAttribute("aria-selected", "true");
        this.#label.textContent = item.textContent;
        this.#close();
    }

    #onItemClick(e) {
        const item = e.target.closest(".branch-dropdown-item");
        if (item) this.#selectItem(item);
    }

    #onKeyDown(e) {
        const item = e.target.closest(".branch-dropdown-item");
        if (!item) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.#selectItem(item);
        } else if (e.key === "Escape") {
            this.#close();
            this.#trigger.focus();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            item.nextElementSibling?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            item.previousElementSibling?.focus();
        }
    }

    #onOutsideClick(e) {
        if (!this.#trigger.closest("#branch-dropdown")?.contains(e.target)) {
            this.#close();
        }
    }

    destroy() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
    }
}

export { DropDown };
