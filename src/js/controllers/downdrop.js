import * as DOM from "./dom";

class DropDown {
    #trigger;
    #list;
    #label;
    #abortController = null;
    #onSelect = null;
    #selectionId = 0;

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
        this.#trigger.addEventListener("keydown", (e) => this.#onTriggerKeyDown(e), { signal });
        this.#list.addEventListener("click", (e) => this.#onItemClick(e), { signal });
        this.#list.addEventListener("keydown", (e) => this.#onKeyDown(e), { signal });
        document.addEventListener("click", (e) => this.#onOutsideClick(e), { signal });
    }

    #open(focusPosition = "selected") {
        this.#list.classList.remove("hidden");
        this.#trigger.setAttribute("aria-expanded", "true");

        if (!focusPosition) return;

        const items = [...this.#list.querySelectorAll(".branch-dropdown-item")];
        const selectedItem = items.find((item) => item.getAttribute("aria-selected") === "true");
        const item = focusPosition === "last" ? items.at(-1) : selectedItem || items[0];
        item?.focus();
    }

    #close() {
        this.#list.classList.add("hidden");
        this.#trigger.setAttribute("aria-expanded", "false");
    }

    #toggle() {
        const isOpen = this.#trigger.getAttribute("aria-expanded") === "true";
        isOpen ? this.#close() : this.#open();
    }

    async #selectItem(item) {
        const branch = item.textContent;
        const selectionId = ++this.#selectionId;
        this.#close();
        this.#trigger.setAttribute("aria-busy", "true");

        try {
            if (this.#onSelect) {
                await this.#onSelect(branch);
            } else {
                this.setSelectedBranch(branch);
            }
        } finally {
            if (selectionId === this.#selectionId) {
                this.#trigger.removeAttribute("aria-busy");
                this.#trigger.focus();
            }
        }
    }

    #onItemClick(e) {
        const item = e.target.closest(".branch-dropdown-item");
        if (item) this.#selectItem(item);
    }

    #onTriggerKeyDown(e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            this.#open(e.key === "ArrowUp" ? "last" : "selected");
        } else if (e.key === "Escape") {
            this.#close();
        }
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
            (item.nextElementSibling || this.#list.firstElementChild)?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            (item.previousElementSibling || this.#list.lastElementChild)?.focus();
        } else if (e.key === "Home") {
            e.preventDefault();
            this.#list.firstElementChild?.focus();
        } else if (e.key === "End") {
            e.preventDefault();
            this.#list.lastElementChild?.focus();
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

    setOnSelect(callback) {
        this.#onSelect = typeof callback === "function" ? callback : null;
    }

    setSelectedBranch(branch) {
        let selectedItem = null;

        this.#list.querySelectorAll(".branch-dropdown-item").forEach((item) => {
            const isSelected = item.textContent === branch;
            item.setAttribute("aria-selected", String(isSelected));
            item.tabIndex = isSelected ? 0 : -1;
            if (isSelected) selectedItem = item;
        });

        if (selectedItem) {
            this.#label.textContent = branch;
        }
    }

    render(branches, selectedBranch = "") {
        if (!Array.isArray(branches)) return;

        const fragment = document.createDocumentFragment();

        branches.forEach((branch) => {
            if (typeof branch !== "string" || !branch.trim()) return;

            const item = document.createElement("li");
            item.className = "branch-dropdown-item";
            item.setAttribute("role", "option");
            const isSelected = branch === selectedBranch;
            item.setAttribute("aria-selected", String(isSelected));
            item.tabIndex = isSelected ? 0 : -1;
            item.textContent = branch;
            fragment.append(item);
        });

        this.#list.replaceChildren(fragment);
        this.#trigger.disabled = !this.#list.children.length;
        this.#label.textContent = selectedBranch || "Set a branch";
        this.#close();
    }
}

const dropDown = new DropDown(DOM.dropDownTrigger, DOM.dropDownList, DOM.dropDownLabel);

export { DropDown };
export default dropDown;
