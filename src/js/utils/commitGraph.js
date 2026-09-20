const getParentShas = (commit) => {
    if (!Array.isArray(commit?.parents)) return [];

    return commit.parents.filter((sha) => typeof sha === "string" && sha);
};

const buildCommitGraphLayout = (commits, renderLimit = commits?.length) => {
    const commitList = Array.isArray(commits) ? commits : [];
    const parsedLimit = Number.parseInt(renderLimit, 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : commitList.length;
    const visibleCommits = commitList.slice(0, limit);
    const activeLanes = [];
    const nodes = [];

    visibleCommits.forEach((commit, row) => {
        let lane = activeLanes.indexOf(commit.sha);

        if (lane === -1) {
            lane = activeLanes.findIndex((sha) => sha === null);
            if (lane === -1) lane = activeLanes.length;
            activeLanes[lane] = commit.sha;
        }

        const parents = getParentShas(commit);
        const [firstParent, ...mergeParents] = parents;

        nodes.push({ commit, lane, parents, row });

        if (!firstParent) {
            activeLanes[lane] = null;
        } else {
            const existingParentLane = activeLanes.indexOf(firstParent);
            activeLanes[lane] = existingParentLane !== -1 && existingParentLane !== lane ? null : firstParent;
        }

        mergeParents.forEach((parentSha) => {
            if (activeLanes.includes(parentSha)) return;

            let parentLane = activeLanes.findIndex((sha) => sha === null);
            if (parentLane === -1) parentLane = activeLanes.length;
            activeLanes[parentLane] = parentSha;
        });
    });

    const nodesBySha = new Map(nodes.map((node) => [node.commit.sha, node]));
    const edges = nodes.flatMap((node) =>
        node.parents.map((parentSha) => {
            const parent = nodesBySha.get(parentSha);

            return {
                fromLane: node.lane,
                fromRow: node.row,
                fromSha: node.commit.sha,
                isContinuation: !parent,
                toLane: parent?.lane ?? node.lane,
                toRow: parent?.row ?? null,
                toSha: parentSha,
            };
        }),
    );
    const laneCount = nodes.reduce((count, node) => Math.max(count, node.lane + 1), 1);

    return {
        edges,
        hasHiddenCommits: commitList.length > visibleCommits.length,
        laneCount,
        nodes,
    };
};

export { buildCommitGraphLayout };
