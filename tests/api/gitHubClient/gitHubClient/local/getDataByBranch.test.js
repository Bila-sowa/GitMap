import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { GitHubClient } from "@/js/api/gitHubClient";
import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";
import { createCommit } from "../../../../fixtures/github/dataParser";

const TEST_REPO_URL = "https://github.com/Bila-sowa/GitMap";
const TEST_BRANCH_NAME = "main";
const COMMITS_URL = "https://api.github.com/repos/Bila-sowa/GitMap/commits?sha=main";

const createResponse = ({ status = 200, body = [], url = COMMITS_URL } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  url,
  headers: new Headers(),
  json: async () => body,
});

const useFetch = (response, expectedUrl = COMMITS_URL) => {
  const requests = [];
  const fetcher = async (url) => {
    requests.push(url);

    if (url !== expectedUrl) {
      throw new Error(`Unexpected request: ${url}`);
    }

    return response;
  };

  vi.stubGlobal("fetch", fetcher);
  return requests;
};

describe("getDataByBranch", () => {
  beforeEach(() => {
    storage.reset();
    vi.spyOn(notifications, "notify").mockResolvedValue();
  });

  afterEach(() => {
    storage.reset();
    vi.restoreAllMocks();
  });

  test("normalizes commits for a valid repository URL and branch name", async () => {
    const rawCommits = [createCommit()];
    const requests = useFetch(createResponse({ body: rawCommits }));
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL);

    expect(result).toStrictEqual({
      success: true,
      commitsDetails: [
        {
          author: {
            name: "Test User",
            email: "test@example.com",
            avatar: "https://avatars.githubusercontent.com/u/1?v=4",
            url: "https://github.com/test-user",
            date: "2026-08-28T12:58:44Z",
          },
          title: "Fix login flow",
          description: "\nHandle expired sessions.",
          hash: "51c497d",
          url: "https://github.com/example/project/commit/51c497d0faee027f4b124401823c59416bda590a",
          sha: "51c497d0faee027f4b124401823c59416bda590a",
          parents: ["282fa46d7bdd39f183a8aa924211106fa250f9a3"],
        },
      ],
    });
    expect(requests).toStrictEqual([COMMITS_URL]);
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  test("properly encodes special characters in branch names", async () => {
    const branchWithSpecialChars = "feature/a&b";
    const expectedUrl = "https://api.github.com/repos/Bila-sowa/GitMap/commits?sha=feature%2Fa%26b";
    const requests = useFetch(createResponse({ body: [createCommit()], url: expectedUrl }), expectedUrl);
    const client = new GitHubClient();

    const result = await client.getDataByBranch(branchWithSpecialChars, TEST_REPO_URL);

    expect(result.success).toBe(true);
    expect(requests).toStrictEqual([expectedUrl]);
  });

  test("falls back to repository link stored in storage when url is omitted", async () => {
    storage.setData({ link: TEST_REPO_URL });
    useFetch(createResponse({ body: [createCommit()] }));
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME);

    expect(result.success).toBe(true);
  });

  test.each([
    { label: "an empty string", branch: "" },
    { label: "a whitespace string", branch: "   " },
    { label: "null", branch: null },
    { label: "undefined", branch: undefined },
    { label: "a number", branch: 42 },
    { label: "a boolean", branch: true },
  ])("notifies and rejects $label as a branch name", async ({ branch }) => {
    const client = new GitHubClient();

    const result = await client.getDataByBranch(branch, TEST_REPO_URL);

    expect(result).toStrictEqual({
      success: false,
      error: "Missing branch name",
      devError: { message: "getDataByBranch requires a valid branch name parameter" },
    });
    expect(notifications.notify).toHaveBeenCalledWith("Missing branch name", "error");
  });

  test("notifies and rejects an invalid GitHub repository URL", async () => {
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, "https://example.com/invalid");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid GitHub URL");
    expect(notifications.notify).toHaveBeenCalledWith("Invalid GitHub URL", "error");
  });

  test("handles HTTP error responses from GitHub API", async () => {
    useFetch(createResponse({ status: 404, body: { message: "Branch not found" } }));
    const client = new GitHubClient();
    const userError = "Not Found (404): Repository or resource not found.";

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL);

    expect(result).toStrictEqual({
      success: false,
      error: userError,
      devError: {
        status: 404,
        message: `${userError} [API Message: "Branch not found", URL: ${COMMITS_URL}]`,
        url: COMMITS_URL,
      },
    });
    expect(notifications.notify).toHaveBeenCalledWith(userError, "error");
  });

  test("handles parser failure for invalid commit payloads", async () => {
    const invalidCommit = createCommit({ sha: "" });
    useFetch(createResponse({ body: [invalidCommit] }));
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL);

    expect(result).toStrictEqual({
      success: false,
      error: "Unexpected response format from GitHub",
      devError: {
        message: "Invalid response data in parseCommitsData",
        rawResponse: invalidCommit,
      },
    });
    expect(notifications.notify).toHaveBeenCalledWith("Unexpected response format from GitHub", "error");
  });

  test("handles request cancellation via AbortSignal without notifying", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal("fetch", async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL, {
      signal: controller.signal,
    });

    expect(result).toStrictEqual({
      success: false,
      cancelled: true,
    });
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});
