import GitHubClient from "../services/getGitHubData.js";

export default class Graph {
    #graph;
    #client;
    #commitsDetails = [];

    constructor(graphElement) {
        this.#graph = graphElement;
        this.#bindEvents();
    }

    async render (link) {
        if (!link) return;
        const client = new GitHubClient(link);
        const data = await client.getData();

        data.commitsDetails.forEach((commit, index) => {
            const formattedTitle = commit.message.split('\n')[0];
            const isLast = index === data.commitsDetails.length - 1;

            const commitCard = `
                <button class="commit" data-id="${index}" aria-label="Open commit ${formattedTitle}" title="Open commit ${formattedTitle}"></button>
                ${isLast ? '' : `
                <div class="connection">
                    <span></span>
                    <span></span>
                </div>
                `}
            `;

            graph.insertAdjacentHTML("beforeend", commitCard);
        });
    };

    #bindEvents() {
        this.#graph.addEventListener('click', this.#handleCommitClick);
        this.#graph.addEventListener('mouseover', this.#handleCommitHover);
        this.#graph.addEventListener('mouseout', this.#handleCommitLeave);
    }

    #handleCommitClick = (event) => {
        const commitButton = event.target.closest('.commit');
        if (!commitButton) return;

        const commitIndex = commitButton.dataset.id;
        console.log('Відкрито коміт з індексом:', commitIndex);
        // тут логіка відкриття коміту
    };

    #handleCommitHover = (event) => {
        const commitButton = event.target.closest('.commit');
        if (!commitButton) return;

        const commitIndex = Number(commitButton.dataset.id);
        this.openCommitModal(commitIndex);
    };

    #handleCommitLeave = (event) => {
        const commitButton = event.target.closest('.commit');
        if (!commitButton) return;

        this.closeCommitModal();
    };

    openCommitModal(commitIndex) {
        const commit = this.#commitsDetails[commitIndex];
        if (!commit) return;

        console.log('Показати модальне вікно для коміту:', commit);
        // тут логіка показу модального вікна
    }

    closeCommitModal() {
        console.log('Приховати модальне вікно');
        // тут логіка приховування модального вікна
    }
}
