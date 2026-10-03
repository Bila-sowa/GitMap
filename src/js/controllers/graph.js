import { config } from "../api/config";
import {
    bindFullComitEvents,
    closeFullCommitModals,
    generateFullCommitModalHTML,
} from "../components/FullCommitModal/index";
import { closeHoverCommitModals, generateHoverCommitModalHTML } from "../components/HoverCommitModal/index";
import { generateLoader, removeLoader } from "../components/Loader/index.js";
import { buildCommitGraphLayout } from "../utils/commitGraph.js";
import notifications from "../utils/notificationManager.js";
import { appendHTML, positionModalNearElement, truncateTitle } from "../utils/utils.js";

class GraphController {
    #body;
    #graph = null;
    #storage;
    #gitHubClient;
    #dropDown;
    #link = null;
    #data = null;
    #eventsController = null;
    #requestController = null;
    #detailsRequestController = null;
    #requestId = 0;
    #currentBranch = null;

    constructor(graphElement, body, storage, gitHubClient, dropDown) {
        this.#graph = graphElement;
        this.#body = body;
        this.#storage = storage;
        this.#gitHubClient = gitHubClient;
        this.#dropDown = dropDown;
    }

    init() {
        return this;
    }

    destroy() {
        this.#requestId += 1;
        this.#eventsController?.abort();
        this.#requestController?.abort();
        this.#detailsRequestController?.abort();
        this.#eventsController = null;
        this.#requestController = null;
        this.#detailsRequestController = null;
        closeFullCommitModals();
        closeHoverCommitModals();
    }

    async render() {
        const link = this.#storage.link;
        if (!link) return { success: false, error: "Missing repository URL" };

        const request = this.#startRequest();

        const loader = generateLoader();

        try {
            const data = await this.#gitHubClient.getData(link, { signal: request.signal });

            if (!this.#isCurrentRequest(request.id, link)) {
                return { success: false, cancelled: true };
            }

            if (!data.success) return data;

            this.#link = link;
            this.#data = data;
            this.#currentBranch = data.defaultBranch || data.branchesDetails[0] || null;

            this.#generateGraph(data.commitsDetails, this.#currentBranch);
            this.#dropDown.render(data.branchesDetails, this.#currentBranch);
            this.#bindEvents();

            return { success: true, currentBranch: this.#currentBranch };
        } catch (error) {
            notifications.notify("Failed to render the repository graph", "error");
            return { success: false, error: error.message };
        } finally {
            removeLoader(loader);
        }
    }

    async renderByBranch(branch) {
        const branchName = typeof branch === "string" ? branch.trim() : "";
        const link = this.#storage.link;

        if (!link || !branchName || !this.#data?.success || this.#link !== link) {
            return { success: false, error: "Repository data or branch name is missing" };
        }

        const request = this.#startRequest();

        const loader = generateLoader();

        try {
            const commits = await this.#gitHubClient.getDataByBranch(branchName, link, { signal: request.signal });

            if (!this.#isCurrentRequest(request.id, link)) {
                return { success: false, cancelled: true };
            }

            if (!commits.success) return commits;

            this.#data = {
                ...this.#data,
                commitsDetails: commits.commitsDetails,
            };
            this.#currentBranch = branchName;

            this.#generateGraph(this.#data.commitsDetails, branchName);
            this.#dropDown.setSelectedBranch(branchName);
            this.#bindEvents();

            return { success: true, currentBranch: branchName };
        } catch (error) {
            notifications.notify("Failed to render the selected branch", "error");
            return { success: false, error: error.message };
        } finally {
            removeLoader(loader);
        }
    }

    refresh() {
        if (this.#currentBranch && this.#link === this.#storage.link) {
            return this.renderByBranch(this.#currentBranch);
        }

        return this.render();
    }

    #startRequest() {
        this.#requestController?.abort();
        this.#detailsRequestController?.abort();
        this.#requestController = new AbortController();

        return {
            id: ++this.#requestId,
            signal: this.#requestController.signal,
        };
    }

    #isCurrentRequest(requestId, link) {
        return requestId === this.#requestId && link === this.#storage.link;
    }

    #getFilesData = async (sha, options = {}) => {
        if (!this.#link || !sha) return;

        const filesData = await this.#gitHubClient.getCommitFiles(this.#link, sha, options);

        return filesData;
    };

    #generateGraph(array, branchName = "main") {
        if (!array) return;

        const COMMIT_SIZE = 40;
        const LANE_GAP = 88;
        const ROW_GAP = 160;
        const CONTINUATION_LENGTH = 70;
        const renderLimit = +config.graph.renderLimit;
        const layout = buildCommitGraphLayout(array, renderLimit);
        const hasContinuation = layout.edges.some((edge) => edge.isContinuation);
        const graphWidth = (layout.laneCount - 1) * LANE_GAP + COMMIT_SIZE;
        const graphHeight = layout.nodes.length
            ? (layout.nodes.length - 1) * ROW_GAP + COMMIT_SIZE + (hasContinuation ? CONTINUATION_LENGTH : 0)
            : 0;

        closeFullCommitModals();
        closeHoverCommitModals();
        this.#graph.replaceChildren();
        this.#graph.dataset.repoUrl = this.#storage.link;
        this.#graph.style.width = `${graphWidth}px`;
        this.#graph.style.height = `${graphHeight}px`;

        const svgNamespace = "http://www.w3.org/2000/svg";
        const edgesSvg = document.createElementNS(svgNamespace, "svg");
        edgesSvg.setAttribute("aria-hidden", "true");
        edgesSvg.setAttribute("class", "commit-edges");
        edgesSvg.setAttribute("viewBox", `0 0 ${graphWidth} ${graphHeight}`);

        layout.edges.forEach((edge) => {
            const startX = edge.fromLane * LANE_GAP + COMMIT_SIZE / 2;
            const startY = edge.fromRow * ROW_GAP + COMMIT_SIZE;
            const endX = edge.toLane * LANE_GAP + COMMIT_SIZE / 2;
            const endY = edge.isContinuation ? startY + CONTINUATION_LENGTH : edge.toRow * ROW_GAP;
            const path = document.createElementNS(svgNamespace, "path");
            const pathData =
                startX === endX
                    ? `M ${startX} ${startY} V ${endY}`
                    : `M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`;

            path.setAttribute("class", edge.isContinuation ? "commit-edge commit-edge-continuation" : "commit-edge");
            path.setAttribute("d", pathData);
            edgesSvg.append(path);

            if (edge.isContinuation) {
                const endpoint = document.createElementNS(svgNamespace, "circle");
                endpoint.setAttribute("class", "commit-continuation-marker");
                endpoint.setAttribute("cx", String(endX));
                endpoint.setAttribute("cy", String(endY));
                endpoint.setAttribute("r", "4");
                edgesSvg.append(endpoint);
            }
        });

        this.#graph.append(edgesSvg);

        layout.nodes.forEach(({ commit, lane, row }, index) => {
            const formattedTitle = truncateTitle(commit.title, 5);
            const isFirst = index === 0;
            const commitButton = document.createElement("button");

            commitButton.className = `commit neon rounded-full${isFirst ? " head-commit" : ""}`;
            commitButton.dataset.id = String(index);
            commitButton.dataset.lane = String(lane);
            commitButton.dataset.sha = commit.sha;
            commitButton.setAttribute("name", formattedTitle);
            commitButton.setAttribute("aria-expanded", "false");
            commitButton.setAttribute("aria-label", `Open commit: ${commit.title}`);
            commitButton.setAttribute("aria-branch", branchName);
            commitButton.style.setProperty("--commit-lane", lane);
            commitButton.style.setProperty("--commit-row", row);
            this.#graph.append(commitButton);

            if (isFirst) {
                const connector = document.createElement("div");
                connector.className = "triangular-connector";
                connector.style.setProperty("--commit-lane", lane);
                this.#graph.append(connector);
            }
        });

        const limitDescription = document.createElement("span");
        limitDescription.className = "limit-description text-smallest";
        limitDescription.textContent = layout.hasHiddenCommits
            ? `Showing ${layout.nodes.length} of ${array.length} loaded commits for this branch.`
            : `Showing all ${layout.nodes.length} loaded commits for this branch.`;
        this.#graph.append(limitDescription);

        notifications.notify("The graph has been successfully generated", "success");
    }

    #bindEvents() {
        if (this.#eventsController) this.#eventsController.abort();
        this.#eventsController = new AbortController();
        const { signal } = this.#eventsController;
        let hoverCloseTimeout = null;
        let activeHoverTrigger = null;

        const cancelHoverClose = () => {
            clearTimeout(hoverCloseTimeout);
            hoverCloseTimeout = null;
        };

        const isHoverTarget = (target) => {
            if (!(target instanceof Node)) return false;

            const tooltip = this.#body.querySelector(".hover-commit-modal");

            return Boolean(activeHoverTrigger?.contains(target) || tooltip?.contains(target));
        };

        const scheduleHoverClose = (event) => {
            if (isHoverTarget(event?.relatedTarget)) {
                cancelHoverClose();
                return;
            }

            cancelHoverClose();
            hoverCloseTimeout = setTimeout(() => {
                hoverCloseTimeout = null;

                const tooltip = this.#body.querySelector(".hover-commit-modal");
                const triggerIsFocused = activeHoverTrigger === document.activeElement;
                const triggerIsHovered = activeHoverTrigger?.matches(":hover");
                const tooltipIsHovered = tooltip?.matches(":hover");

                if (triggerIsFocused || triggerIsHovered || tooltipIsHovered) return;

                closeHoverCommitModals();
                activeHoverTrigger = null;
            }, 150);
        };

        signal.addEventListener("abort", cancelHoverClose, { once: true });

        const showHoverTooltip = (commitButton) => {
            cancelHoverClose();

            if (activeHoverTrigger === commitButton && this.#body.querySelector(".hover-commit-modal")) return;

            const commit = this.#data?.commitsDetails.find((item) => item.sha === commitButton.dataset.sha);
            const tooltip = generateHoverCommitModalHTML(commit);

            if (!tooltip) return;

            appendHTML(tooltip);

            const tooltipDOM = this.#body.querySelector("#hover-commit-modal");
            if (!tooltipDOM) return;

            activeHoverTrigger = commitButton;
            commitButton.setAttribute("aria-describedby", tooltipDOM.id);
            positionModalNearElement(tooltipDOM, commitButton);
            tooltipDOM.addEventListener("mouseenter", cancelHoverClose, { signal });
            tooltipDOM.addEventListener("mouseleave", scheduleHoverClose, { signal });
        };

        document.addEventListener(
            "keydown",
            (event) => {
                if (event.key !== "Escape" || !this.#body.querySelector(".hover-commit-modal")) return;

                cancelHoverClose();
                closeHoverCommitModals();
                activeHoverTrigger = null;
            },
            { signal },
        );

        this.#graph.addEventListener(
            "click",
            async (e) => {
                const commitButton = e.target.closest("[data-id]");
                if (!commitButton) return;

                const { sha } = commitButton.dataset;
                const commit = this.#data?.commitsDetails.find((item) => item.sha === sha);
                if (!commit) return;

                this.#detailsRequestController?.abort();
                const detailsRequest = new AbortController();
                this.#detailsRequestController = detailsRequest;

                const loader = generateLoader();

                try {
                    const filesData = await this.#getFilesData(sha, { signal: detailsRequest.signal });

                    if (detailsRequest !== this.#detailsRequestController || !commitButton.isConnected) return;
                    if (!filesData?.success) return;

                    const modal = generateFullCommitModalHTML(commit, filesData);
                    if (!modal) return;

                    appendHTML(modal);
                    bindFullComitEvents(commitButton);
                } finally {
                    if (detailsRequest === this.#detailsRequestController) {
                        this.#detailsRequestController = null;
                    }
                    removeLoader(loader);
                }
            },
            { signal },
        );

        this.#graph.addEventListener(
            "mouseover",
            (e) => {
                const commitButton = e.target.closest("[data-id]");
                if (!commitButton) return;
                if (commitButton.contains(e.relatedTarget)) return;

                showHoverTooltip(commitButton);
            },
            { signal },
        );

        this.#graph.addEventListener(
            "focusin",
            (e) => {
                const commitButton = e.target.closest("[data-id]");
                if (commitButton) showHoverTooltip(commitButton);
            },
            { signal },
        );

        this.#graph.addEventListener(
            "mouseout",
            (e) => {
                if (e.target.closest("[data-id]")) scheduleHoverClose(e);
            },
            { signal },
        );

        this.#graph.addEventListener(
            "focusout",
            (e) => {
                if (e.target.closest("[data-id]")) scheduleHoverClose(e);
            },
            { signal },
        );
    }
}

export { GraphController };
