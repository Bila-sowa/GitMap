import GitHubClient from "@/js/services/getGitHubData";
import * as tools from "../tools/testTools";

export default async function test_nd2u3_Data() {
    const config = new tools.TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_nd2u3_Data",
            name: "getCommitFiles",
            type: "method"
        },

        {
            files: tools.ANY_VALID,
            success: true,
        },

        {
            TEST_REPO_URL: "https://github.com/Bila-sowa/GitMap",
            TEST_COMMIT_SHA: "46f5cd270ddda0267790caf4fe48ec8895149ec6",
        }
    )

    const client = new GitHubClient();
    let data = {};

    try {
        data = await client.getCommitFiles(config.testData.TEST_REPO_URL, config.testData.TEST_COMMIT_SHA);

        const result = tools.validateTestData(data, config.expected);

        return new tools.TestFeedBack({
            ...config.details,
            success: result,
            data: data,
        });
    } catch (e) {
        console.error(e);
        return new tools.TestFeedBack({
            ...config.details,
            success: false,
            data: data,
        });
    };
}
