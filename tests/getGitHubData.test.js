import GitHubClient from "../src/js/services/getGitHubData.js"
import TestFeedBack from "./testFeedBack.js";

export default async function test_001_D() {
    const client = new GitHubClient();
    try {
        const [parsedData, commitFilesData, rateLimit, isAuthenticated] = await Promise.all([
            client.getData("https://github.com/Bila-sowa/GitMap"),
            client.getCommitFiles("https://github.com/Bila-sowa/GitMap", "46f5cd270ddda0267790caf4fe48ec8895149ec6"),
            client.getRateLimit(),
            client.isAuthenticated()
        ]);

        const data = {
            getData: parsedData,
            getCommitFiles: commitFilesData,
            rateLimit: rateLimit,
            isAuthenticated: isAuthenticated,
        };


        return new TestFeedBack("getGitHubData.js", "GitHubClient", "class", true, data)
    } catch (err) {
        console.error(err);
        return new TestFeedBack("getGitHubData.js", "GitHubClient", "class", false, err.message)
    }
}


