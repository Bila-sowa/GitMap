import GitHubHttpApi from "@/js/api/gitHubClient/gitHubHttpApi";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description
 *
 * The test returns an array of HTTP errors for the user based on the specified patterns.
 *
 * #### Params
 * - file: `gitHubHttpApi.js`
 * - test: `test_483nq_Data`
 * - name: `getHttpErrorMessage`
 * - type: `method`
 *
 * @returns TestFeedback
 */
export default async function test_483nq_Data() {
    const httpController = new GitHubHttpApi();
    const config = new TestConfig(
        {
            file: "httpController.js",
            test: "test_483nq_Data",
            name: "httpController",
            type: "method",
        },
        [
            "Bad Request (400): Unable to process request.",
            "Unprocessable Entity (422): Validation failed or resource is locked.",
            "Gateway Timeout (504): GitHub timed out waiting for upstream server.",
            "GitHub API error (HTTP 402).",
        ],
        [400, 422, 504, 402],
    );

    return config.run(async (testData) => {
        let result = [];
        testData.map((error) => result.push(httpController.getHttpErrorMessage(error)));
        return result;
    });
}
