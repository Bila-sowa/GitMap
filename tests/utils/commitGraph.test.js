import { buildCommitGraphLayout } from "@/js/utils/commitGraph";
import { TestConfig } from "../tools/testTools";

export default function test_7w1cf_Data() {
    const config = new TestConfig(
        {
            file: "commitGraph.js",
            test: "test_7w1cf_Data",
            name: "buildCommitGraphLayout",
            type: "function",
        },
        {
            edgeCount: 5,
            externalParentMarked: true,
            lanes: [0, 0, 1, 0],
            mergeReturnsToMainLane: true,
        },
        [
            { sha: "merge", parents: ["main-parent", "branch-parent"] },
            { sha: "main-parent", parents: ["common"] },
            { sha: "branch-parent", parents: ["common"] },
            { sha: "common", parents: ["outside-page"] },
        ],
    );

    return config.run((commits) => {
        const layout = buildCommitGraphLayout(commits, 30);
        const branchEdge = layout.edges.find((edge) => edge.fromSha === "branch-parent" && edge.toSha === "common");

        return {
            edgeCount: layout.edges.length,
            externalParentMarked: layout.edges.some((edge) => edge.toSha === "outside-page" && edge.isContinuation),
            lanes: layout.nodes.map((node) => node.lane),
            mergeReturnsToMainLane: branchEdge?.fromLane === 1 && branchEdge.toLane === 0,
        };
    });
}
