import { GitHubClient } from "../src/js/services/getGitHubData.js"
import { TestFeedBack } from "./testFeedBack.js";

export default async function test() {
    const client = new GitHubClient("https://github.com/Bila-sowa/Registration-service");

    try {
        const [rawData, parsedData] = await Promise.all([
            client.getRawData(),
            client.getData(),
        ]);

        const data = { getRawData: rawData, getData: parsedData };

        if (!data.getRawData.success) throw new Error(data.getRawData.error || 'getRawData() failed');
        if (!data.getData.success) throw new Error(data.getData.error || 'getData() failed');

        return new TestFeedBack("getGitHubData.mjs", "GitHubClient", "class", true, data)
    } catch (err) { return new TestFeedBack("getGitHubData.mjs", "GitHubClient", "class", false, err.message) }
}

console.log(await test())
