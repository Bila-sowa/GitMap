import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import GitHubTokenManager from "@/js/api/gitHubClient/gitHubTokenManager";
import { Storage } from "@/js/data/storage";
import notifications from "@/js/utils/notificationManager";

const ACTIVE_TOKEN = "ghp_activeToken";

const createHeaders = () => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${ACTIVE_TOKEN}`,
});

const createStorage = () => {
  const storage = new Storage();
  storage.setData({ token: ACTIVE_TOKEN });
  return storage;
};

const createHttpApi = () => ({
  createHttpError: async () => ({ error: "Unauthorized" }),
});

const createDeferredFetcher = () => {
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
  const findRequest = (token) => requests.find((request) => request.authorization === `Bearer ${token}`);
  const resolveRequest = (token, response) => findRequest(token).resolve(response);

  return { fetcher, findRequest, resolveRequest };
};

describe("setToken", () => {
  beforeEach(() => {
    vi.spyOn(notifications, "notify").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("preserves the current authorization and storage when the token is rejected", async () => {
    const storage = createStorage();
    const { fetcher, resolveRequest } = createDeferredFetcher();
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher);

    const pendingRequest = tokenManager.setToken("ghp_invalidToken");
    resolveRequest("ghp_invalidToken", { ok: false, status: 401 });
    const result = await pendingRequest;

    expect(result).toStrictEqual({ success: false, error: "Unauthorized" });
    expect(tokenManager.getAuthorizationHeader()).toBe(`Bearer ${ACTIVE_TOKEN}`);
    expect(storage.getData().token).toBe(ACTIVE_TOKEN);
    expect(notifications.notify).toHaveBeenCalledWith("Unauthorized", "error");
  });

  test("applies only the latest successful token and isolates candidate headers", async () => {
    const storage = createStorage();
    const { fetcher, findRequest, resolveRequest } = createDeferredFetcher();
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher);

    const staleRequest = tokenManager.setToken("ghp_staleSuccessToken");
    const latestRequest = tokenManager.setToken("ghp_latestSuccessToken");
    const staleCandidate = findRequest("ghp_staleSuccessToken");
    const latestCandidate = findRequest("ghp_latestSuccessToken");

    expect(staleCandidate.headers).not.toBe(latestCandidate.headers);
    expect(staleCandidate.authorization).toBe("Bearer ghp_staleSuccessToken");
    expect(latestCandidate.authorization).toBe("Bearer ghp_latestSuccessToken");

    resolveRequest("ghp_latestSuccessToken", { ok: true });
    const latestResult = await latestRequest;
    resolveRequest("ghp_staleSuccessToken", { ok: true });
    const staleResult = await staleRequest;

    expect(latestResult).toStrictEqual({ success: true });
    expect(staleResult).toStrictEqual({ success: false, cancelled: true });
    expect(tokenManager.getAuthorizationHeader()).toBe("Bearer ghp_latestSuccessToken");
    expect(storage.getData().token).toBe("ghp_latestSuccessToken");
    expect(notifications.notify).toHaveBeenCalledTimes(1);
    expect(notifications.notify).toHaveBeenCalledWith("The token has been successfully set", "success");
  });

  test("cancels a stale failure after the latest token succeeds", async () => {
    const storage = createStorage();
    const { fetcher, resolveRequest } = createDeferredFetcher();
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher);

    const staleRequest = tokenManager.setToken("ghp_staleFailureToken");
    const latestRequest = tokenManager.setToken("ghp_latestFailureToken");

    resolveRequest("ghp_latestFailureToken", { ok: true });
    await latestRequest;
    resolveRequest("ghp_staleFailureToken", { ok: false, status: 401 });
    const result = await staleRequest;

    expect(result).toStrictEqual({ success: false, cancelled: true });
    expect(tokenManager.getAuthorizationHeader()).toBe("Bearer ghp_latestFailureToken");
    expect(storage.getData().token).toBe("ghp_latestFailureToken");
    expect(notifications.notify).not.toHaveBeenCalledWith("Unauthorized", "error");
  });

  test("clears the authorization and storage and cancels a pending request for an empty token", async () => {
    const storage = createStorage();
    const { fetcher, resolveRequest } = createDeferredFetcher();
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher);

    const pendingRequest = tokenManager.setToken("ghp_pendingToken");
    const result = await tokenManager.setToken("");
    resolveRequest("ghp_pendingToken", { ok: true });
    const pendingResult = await pendingRequest;

    expect(result).toStrictEqual({ success: true });
    expect(pendingResult).toStrictEqual({ success: false, cancelled: true });
    expect(tokenManager.getAuthorizationHeader()).toBe(null);
    expect(storage.getData().token).toBe("");
  });
});
