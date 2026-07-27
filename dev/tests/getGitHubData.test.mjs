import { GitHubClient } from "./getGitHubData.mjs"
import { TestFeedBack } from "./testFeedBack.mjs";

export default async function test() {
    const client = new GitHubClient("https://github.com/Bila-sowa/Registration-servicewdwd");

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
