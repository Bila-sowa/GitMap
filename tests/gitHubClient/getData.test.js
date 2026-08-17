import GitHubClient from "@/js/services/getGitHubData";
import * as tools from "../tools/testTools";

/**
 * #### Description:
 * 
 * The test verifies the formatted data for commits and branches.
 * 
 * #### Params:
 * - file: getGitHubData.js
 * - test: test_hvnws_Data
 * - name: getData
 * - type: method
 * 
 * @returns TestFeedback
 */
export default async function test_hvnws_Data() {
    const config = new tools.TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_hvnws_Data",
            name: "getData",
            type: "method",
        },

        {
            commitsDetails: tools.ANY_VALID,
            branchesDetails: tools.ANY_VALID,
            success: true,
        },

        {
            TEST_REPO_URL: "https://github.com/Bila-sowa/GitMap"
        }

    )

    const client = new GitHubClient();

    let data = {};

    try {
        data = await client.getData(config.testData.TEST_REPO_URL);

        const result = tools.validateTestData(data, config.expected);

        return new tools.TestFeedback({
            ...config.details,
            success: result,
            data: data,
        });
    } catch (err) {
        console.error(err);
        return new tools.TestFeedback({
            ...config.details,
            success: false,
            data: data,
        });
    };
};
