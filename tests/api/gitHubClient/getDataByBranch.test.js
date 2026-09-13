import { GitHubClient } from "@/js/api/gitHubClient";
import { TestConfig, ANY_VALID } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test verifies that commits for a specific branch are retrieved successfully via the REST API.
 *
 * #### Params:
 * - file: `gitHubClient.js`
 * - test: `test_vt6mk_Data`
 * - name: `getDataByBranch`
 * - type: `method`
 *
 * @returns TestFeedback
 */
export default async function test_vt6mk_Data() {
    const config = new TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_vt6mk_Data",
            name: "getDataByBranch",
            type: "method",
        },
        {
            commitsDetails: ANY_VALID,
            success: true,
        },
        {
            TEST_REPO_URL: "https://github.com/Bila-sowa/GitMap",
            TEST_BRANCH_NAME: "main",
        },
    );

    const client = new GitHubClient();

    return config.run(async ({ TEST_REPO_URL, TEST_BRANCH_NAME }) => {
        return await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL);
    });
}
