import GitHubClient from "@/js/services/getGitHubData";
import { TestConfig, ANY_VALID } from "../tools/testTools";

/**
 * #### Description:
 * 
 * The test verifies the formatted data for commits and branches.
 * 
 * #### Params:
 * - file: `getGitHubData.js`
 * - test: `test_hvnws_Data`
 * - name: `getData`
 * - type: `method`
 * 
 * @returns TestFeedback
 */
export default async function test_hvnws_Data() {
    const config = new TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_hvnws_Data",
            name: "getData",
            type: "method",
        },
        {
            commitsDetails: ANY_VALID,
            branchesDetails: ANY_VALID,
            success: true,
        },
        {
            TEST_REPO_URL: "https://github.com/Bila-sowa/GitMap",
        },
    );

    const client = new GitHubClient();

    return config.run(async ({ TEST_REPO_URL }) => {
        return await client.getData(TEST_REPO_URL);
    });
}
