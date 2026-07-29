import { GitHubClient } from "../src/js/services/getGitHubData.js"
import GITHUB_TOKEN from "../src/js/services/gitHubToken.js";
import { TestFeedBack } from "./testFeedBack.js";

export default async function test_001() {
    const client = new GitHubClient("https://github.com/Bila-sowa/Registration-service");
    client.setToken(GITHUB_TOKEN)
    try {
        const [rawData, parsedData, rateLimitData] = await Promise.all([
            client.getRawData(),
            client.getData(),
            client.getRateLimit(),
        ]);

        const data = { getRawData: rawData, getData: parsedData, getRateLimit: rateLimitData};

        if (!data.getRawData.success) throw new Error(data.getRawData.error || 'getRawData() failed');
        if (!data.getData.success) throw new Error(data.getData.error || 'getData() failed');
        if (!data.getRateLimit.success) throw new Error(data.getRateLimit.error || 'getRateLimit() failed');

        return new TestFeedBack("getGitHubData.mjs", "GitHubClient", "class", true, data)
    } catch (err) { return new TestFeedBack("getGitHubData.mjs", "GitHubClient", "class", false, err.message) }
}


