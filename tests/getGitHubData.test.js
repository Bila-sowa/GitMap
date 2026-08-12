import GitHubClient from "../src/js/services/getGitHubData.js"
import TestFeedBack from "./testFeedBack.js";

export default async function test_001_D() {
    const client = new GitHubClient();
    try {
        const [parsedData, commitFilesData] = await Promise.all([
            client.getData("https://github.com/Bila-sowa/GitMap"),
            client.getCommitFiles("https://github.com/Bila-sowa/GitMap", "46f5cd270ddda0267790caf4fe48ec8895149ec6"),
        ]);

        const data = { getData: parsedData, getCommitFiles: commitFilesData };

        if (!data.getData.success) throw new Error(data.getData.error || 'getData() failed');
        if (!data.getCommitFiles.success) throw new Error(data.getCommitFiles.error || 'getCommitFiles() failed');

        return new TestFeedBack("getGitHubData.js", "GitHubClient", "class", true, data)
    } catch (err) {
        console.error(err);
        return new TestFeedBack("getGitHubData.js", "GitHubClient", "class", false, err.message)
    }
}


