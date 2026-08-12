export default class HoverCommitModal {
    #state = null;

    constructor(state) {
        this.#state = state;
    }

    bindEvents() {
        this.#state.graph.addEventListener("mouseover", this.#openHoverCommitModal);
        this.#state.graph.addEventListener("mouseout", this.#closeHoverCommitModal);
    }

    #generateHTML = (commit) => {
        const shortDate = commit.author.date
            .split(",")[0]
            .trim()
            .split(".")
            .map((part, i) => (i === 2 ? part.slice(-2) : part))
            .join(".");


        return `
            <div class="hover-commit-modal" id="hover-commit-modal" role="dialog">
                <h3>${commit.title}</h3>
                <div class="hover-commit-body">
                    <div class="hover-commit-data">
                        <div class="hover-commit-item rounded-normal" style="display: flex; align-items: center; gap: 10px;" title="Email: ${commit.author.email}">
                            <span>Author: </span>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span>${commit.author.name}</span>
                                <img class="avatar rounded-full" src="${commit.author.avatar}" alt="${commit.author.name} avatar">
                            </div>
                        </div>
                        <div class="hover-commit-item rounded-normal">
                            <span>Hash: </span>
                            <span>#${commit.hash}</span>
                        </div>
                        <div class="hover-commit-item rounded-normal">
                            <span>Date: </span>
                            <span>${shortDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    #openHoverCommitModal = (e) => {
        const commitButton = e.target.closest(".commit");
        if (!commitButton) return;

        const data = this.#state.getData();
        const commit = data?.commitsDetails?.[+commitButton.dataset.id];

        if (!commit || this.#state.isFullOpen || this.#state.isHoverOpen) return;

        this.#state.setHoverTimeout(() => {
            if (this.#state.isFullOpen) return;
            this.#state.isHoverOpen = true;

            const card = this.#generateHTML(commit)
            commitButton.insertAdjacentHTML("beforeend", card);
        });
    };

    #closeHoverCommitModal = (e) => {
        if (e?.relatedTarget && e.target.closest(".commit")?.contains(e.relatedTarget)) {
            return;
        }
        this.#state.closeHoverModal();
    };
}

