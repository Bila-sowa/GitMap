import GitHubTokenManager from "@/js/api/gitHubClient/gitHubTokenManager";
import GitHubHttpApi from "@/js/api/gitHubClient/gitHubHttpApi";
import { ANY_VALID, TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test verifies that the rate limit data has been successfully retrieved. The values cannot be arbitrary, as the limits are dynamic.
 *
 * #### Params:
 * - file: `gitHubTokenManager.js`
 * - test: `test_05yau`
 * - name: `setToken`
 * - type: `method`
 *
 * @returns TestFeedback
 */
export default async function test_05yau_Data() {
    const config = new TestConfig(
        {
            file: "gitHubTokenManager.js",
            test: "test_05yau_Data",
            name: "setToken",
            type: "method",
        },
        {
            success: false,
            error: ANY_VALID,
            devError: ANY_VALID,
        },
        {
            token: "ghu_example_token",
        },
    );

    const headers = { Accept: "application/vnd.github+json" };
    const httpApi = new GitHubHttpApi();
    const gitHubTokenManager = new GitHubTokenManager(headers, httpApi);

    return config.run(async ({ token }) => {
        return gitHubTokenManager.setToken(token);
    });
}
