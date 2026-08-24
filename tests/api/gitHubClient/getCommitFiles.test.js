import { GitHubClient } from "@/js/api/gitHubClient";
import { TestConfig, ANY_VALID } from "../../tools/testTools";

/**
 * #### Description:
 * 
 * The test verifies the formatted data for commits and branches.
 * 
 * #### Params:
 * - file: `gitHubClient.js`
 * - test: `test_nd2u3_Data`
 * - name: `getCommitFiles`
 * - type: `method`
 * 
 * @returns TestFeedback
 */
export default async function test_nd2u3_Data() {
    const config = new TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_nd2u3_Data",
            name: "getCommitFiles",
            type: "method",
        },
        {
            files: ANY_VALID,
            success: true,
            truncated: false
        },
        {
            TEST_REPO_URL: "https://github.com/Bila-sowa/GitMap",
            TEST_COMMIT_SHA: "46f5cd270ddda0267790caf4fe48ec8895149ec6",
        },
    );

    const client = new GitHubClient();

    return config.run(async ({ TEST_REPO_URL, TEST_COMMIT_SHA }) => {
        return await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA);
    });
}
