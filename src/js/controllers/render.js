import { graph, updateElements } from "./dom.js";
import GitHubClient from "../services/getGitHubData.js";

const renderGraph =  async (link) => {
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

export {
    renderGraph,
};
