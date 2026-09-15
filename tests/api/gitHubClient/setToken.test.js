import GitHubTokenManager from "@/js/api/gitHubClient/gitHubTokenManager";
import { Storage } from "@/js/data/storage";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test verifies that rejected or stale tokens preserve the current state and explicit removal clears it.
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
            candidateHeadersIsolated: true,
            latestAuthorizationApplied: true,
            latestStorageApplied: true,
            staleSuccessCancelled: true,
            staleFailureCancelled: true,
            staleFailureStatePreserved: true,
            explicitAuthorizationCleared: true,
            explicitStorageCleared: true,
            explicitSuccess: true,
            staleAfterClearCancelled: true,
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
    const requests = [];
    const fetcher = async (url, options) =>
        new Promise((resolve) => {
            requests.push({
                url,
                authorization: options.headers.Authorization,
                headers: options.headers,
                resolve,
            });
        });
    const gitHubTokenManager = new GitHubTokenManager(headers, httpApi, storage, fetcher);

    const findRequest = (token) => requests.find((request) => request.authorization === `Bearer ${token}`);
    const resolveRequest = (token, response) => findRequest(token).resolve(response);

    return config.run(async () => {
        const rejectedPromise = gitHubTokenManager.setToken("invalid-token");
        resolveRequest("invalid-token", { ok: false, status: 401 });
        const rejectedResult = await rejectedPromise;
        const rejectedAuthorizationPreserved = gitHubTokenManager.getAuthorizationHeader() === "Bearer active-token";
        const rejectedStoragePreserved = storage.token === "active-token";

        const staleSuccessPromise = gitHubTokenManager.setToken("stale-success-token");
        const latestSuccessPromise = gitHubTokenManager.setToken("latest-success-token");
        const staleSuccessRequest = findRequest("stale-success-token");
        const latestSuccessRequest = findRequest("latest-success-token");
        const candidateHeadersIsolated =
            staleSuccessRequest.headers !== latestSuccessRequest.headers &&
            staleSuccessRequest.authorization === "Bearer stale-success-token" &&
            latestSuccessRequest.authorization === "Bearer latest-success-token";

        resolveRequest("latest-success-token", { ok: true });
        await latestSuccessPromise;
        resolveRequest("stale-success-token", { ok: true });
        const staleSuccessResult = await staleSuccessPromise;
        const latestAuthorizationApplied =
            gitHubTokenManager.getAuthorizationHeader() === "Bearer latest-success-token";
        const latestStorageApplied = storage.token === "latest-success-token";

        const staleFailurePromise = gitHubTokenManager.setToken("stale-failure-token");
        const latestFailurePromise = gitHubTokenManager.setToken("latest-failure-token");
        resolveRequest("latest-failure-token", { ok: true });
        await latestFailurePromise;
        resolveRequest("stale-failure-token", { ok: false, status: 401 });
        const staleFailureResult = await staleFailurePromise;
        const staleFailureStatePreserved =
            gitHubTokenManager.getAuthorizationHeader() === "Bearer latest-failure-token" &&
            storage.token === "latest-failure-token";

        const staleAfterClearPromise = gitHubTokenManager.setToken("stale-after-clear-token");
        const explicitResult = await gitHubTokenManager.setToken("");
        resolveRequest("stale-after-clear-token", { ok: true });
        const staleAfterClearResult = await staleAfterClearPromise;

        return {
            rejectedAuthorizationPreserved,
            rejectedStoragePreserved,
            rejectedToken: !rejectedResult.success,
            candidateHeadersIsolated,
            latestAuthorizationApplied,
            latestStorageApplied,
            staleSuccessCancelled: staleSuccessResult.cancelled === true,
            staleFailureCancelled: staleFailureResult.cancelled === true,
            staleFailureStatePreserved,
            explicitAuthorizationCleared: gitHubTokenManager.getAuthorizationHeader() === null,
            explicitStorageCleared: storage.token === "",
            explicitSuccess: explicitResult.success,
            staleAfterClearCancelled: staleAfterClearResult.cancelled === true,
        };
    });
}
