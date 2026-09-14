import GitHubTokenManager from "@/js/api/gitHubClient/gitHubTokenManager";
import { Storage } from "@/js/data/storage";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test verifies that both explicit token removal and rejected tokens clear authorization and stored state.
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
            explicitAuthorizationCleared: true,
            explicitStorageCleared: true,
            explicitSuccess: true,
            rejectedAuthorizationCleared: true,
            rejectedStorageCleared: true,
            rejectedToken: true,
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
        const explicitResult = await gitHubTokenManager.setToken("");
        const explicitAuthorizationCleared = gitHubTokenManager.getAuthorizationHeader() === null;
        const explicitStorageCleared = storage.token === "";
        const rejectedResult = await gitHubTokenManager.setToken("invalid-token");

        return {
            explicitAuthorizationCleared,
            explicitStorageCleared,
            explicitSuccess: explicitResult.success,
            rejectedAuthorizationCleared: gitHubTokenManager.getAuthorizationHeader() === null,
            rejectedStorageCleared: storage.token === "",
            rejectedToken: !rejectedResult.success,
        };
    });
}
