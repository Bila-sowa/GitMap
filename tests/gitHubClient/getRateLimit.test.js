import GitHubClient from "@/js/services/getGitHubData";
import * as tools from "../tools/testTools";

export default async function test_3j3f8_Data() {
    const config = new tools.TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_3j3f8_Data",
            name: "getRateLimit",
            type: "method",
        },

        {
            data: {
                limitPerNumber: tools.ANY_VALID,
                usedPerNumber: tools.ANY_VALID,
                usedPerPercent: tools.ANY_VALID,
            },
            success: true,
        },
    );

    const client = new GitHubClient();

    let data = {};

    try {
        data = await client.getRateLimit();

        const result = tools.validateTestData(data, config.expected);

        return new tools.TestFeedBack({
            ...config.details,
            success: result,
            data: data,
        })
    } catch (e) {
        console.error(e);
        return new tools.TestFeedBack({
            ...config.details,
            success: result,
            data: data,
        })
    }
}
