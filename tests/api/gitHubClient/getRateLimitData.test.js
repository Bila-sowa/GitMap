import { GitHubClient } from "@/js/api/gitHubClient";
import { TestConfig, ANY_VALID } from "../../tools/testTools";

/**
 * #### Description:
 * 
 * The test verifies that the rate limit data has been successfully retrieved. The values cannot be arbitrary, as the limits are dynamic.
 * 
 * #### Params:
 * - file: `gitHubClient.js`
 * - test: `test_3j3f8_Data`
 * - name: `getRateLimitData`
 * - type: `method`
 * 
 * @returns TestFeedback
 */
export default async function test_3j3f8_Data() {
    const config = new TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_3j3f8_Data",
            name: "getRateLimitData",
            type: "method",
        },
        {
            data: {
                limitPerNumber: ANY_VALID,
                usedPerNumber: ANY_VALID,
                usedPerPercent: ANY_VALID,
            },
            success: true,
        },
    );

    const client = new GitHubClient();

    return config.run(async () => {
        return await client.getRateLimitData();
    });
}
