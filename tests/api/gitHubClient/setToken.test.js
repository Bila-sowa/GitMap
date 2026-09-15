import GitHubTokenManager from "@/js/api/gitHubClient/gitHubTokenManager";
import { Storage } from "@/js/data/storage";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test verifies that rejected tokens preserve the current state and explicit removal clears it.
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
            rejectedAuthorizationPreserved: true,
            rejectedStoragePreserved: true,
            rejectedToken: true,
            explicitAuthorizationCleared: true,
            explicitStorageCleared: true,
            explicitSuccess: true,
        },
    );

    const headers = {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer active-token",
    };
    const storage = new Storage({ token: "active-token" });
    const httpApi = {
        createHttpError: async () => ({ error: "Unauthorized" }),
    };
    const fetcher = async () => ({ ok: false, status: 401 });
    const gitHubTokenManager = new GitHubTokenManager(headers, httpApi, storage, fetcher);

    return config.run(async () => {
        const rejectedResult = await gitHubTokenManager.setToken("invalid-token");
        const rejectedAuthorizationPreserved =
            gitHubTokenManager.getAuthorizationHeader() === "Bearer active-token";
        const rejectedStoragePreserved = storage.token === "active-token";
        const explicitResult = await gitHubTokenManager.setToken("");

        return {
            rejectedAuthorizationPreserved,
            rejectedStoragePreserved,
            rejectedToken: !rejectedResult.success,
            explicitAuthorizationCleared: gitHubTokenManager.getAuthorizationHeader() === null,
            explicitStorageCleared: storage.token === "",
            explicitSuccess: explicitResult.success,
        };
    });
}
