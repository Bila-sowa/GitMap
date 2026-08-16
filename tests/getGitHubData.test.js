import GitHubClient from "../src/js/services/getGitHubData.js"
import { ANY_VALID, TestFeedBack, validateTestData } from "./testTools.js";

export default async function test_001_D() {
    const details = {
        file: "getGitHubData.js",
        test: "test_001_D",
        name: "GitHubClient",
        type: "class",
    };
    const client = new GitHubClient();
    const TEST_REPO_URL = "https://github.com/Bila-sowa/GitMap";
    const TEST_COMMIT_SHA = "46f5cd270ddda0267790caf4fe48ec8895149ec6";
    let data = {};

    try {
        [data.getData, data.getCommitFiles, data.rateLimit, data.isAuthenticated] = await Promise.all([
            client.getData(TEST_REPO_URL),
            client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA),
            client.getRateLimit(),
            client.isAuthenticated()
        ]);

        const expected = {
            getData: ANY_VALID,
            getCommitFiles: ANY_VALID,
            rateLimit: ANY_VALID,
            isAuthenticated: ANY_VALID,
        };

        const result = validateTestData(data);

        return new TestFeedBack({
            ...details,
            success: result,
            data: data
        });
    } catch (err) {
        console.error(err);
        return new TestFeedBack({
            ...details,
            success: false,
            data: data
        })
    };
};


