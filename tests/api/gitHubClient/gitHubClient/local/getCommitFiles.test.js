import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { GitHubClient } from "@/js/api/gitHubClient";
import notifications from "@/js/utils/notificationManager";
import { createFile } from "../../../../fixtures/github/dataParser";

const TEST_REPO_URL = "https://github.com/Bila-sowa/GitMap";
const TEST_COMMIT_SHA = "46f5cd270ddda0267790caf4fe48ec8895149ec6";
const COMMIT_URL = `https://api.github.com/repos/Bila-sowa/GitMap/commits/${TEST_COMMIT_SHA}`;

const createResponse = ({ status = 200, body = {}, url = COMMIT_URL } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  url,
  headers: new Headers(),
  json: async () => body,
});

const useFetch = (response) => {
  const requests = [];
  const fetcher = async (url) => {
    requests.push(url);

    if (url !== COMMIT_URL) {
      throw new Error(`Unexpected request: ${url}`);
    }

    return response;
  };

  vi.stubGlobal("fetch", fetcher);
  return requests;
};

const createFiles = (count) =>
  Array.from({ length: count }, (_, index) => createFile({ filename: `src/file-${index}.js` }));

describe("getCommitFiles", () => {
  beforeEach(() => {
    vi.spyOn(notifications, "notify").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("normalizes commit files for a valid repository URL and commit SHA", async () => {
    const rawFiles = [
      createFile({ filename: "src/js/<app>.js", status: "modified", additions: 12, deletions: 3 }),
      createFile({ filename: "assets/README", status: "added", additions: 5, deletions: 0 }),
    ];
    const requests = useFetch(createResponse({ body: { files: rawFiles } }));
    const client = new GitHubClient();

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA);

    expect(result).toStrictEqual({
      success: true,
      files: [
        {
          name: "src/js/&lt;app&gt;.js",
          additions: 12,
          deletions: 3,
          extension: "js",
          fullStatus: "modified",
          status: "M",
        },
        {
          name: "assets/README",
          additions: 5,
          deletions: 0,
          extension: "file",
          fullStatus: "added",
          status: "A",
        },
      ],
      truncated: false,
    });
    expect(requests).toStrictEqual([COMMIT_URL]);
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  test("marks the result as truncated when commit contains 300 files", async () => {
    useFetch(createResponse({ body: { files: createFiles(300) } }));
    const client = new GitHubClient();

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA);

    expect(result.success).toBe(true);
    expect(result.truncated).toBe(true);
    expect(result.files).toHaveLength(300);
  });

  test("notifies and rejects an invalid GitHub repository URL", async () => {
    const client = new GitHubClient();

    const result = await client.getCommitFiles("https://example.com/invalid", TEST_COMMIT_SHA);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid GitHub URL");
    expect(notifications.notify).toHaveBeenCalledWith("Invalid GitHub URL", "error");
  });

  test.each([
    { label: "an empty string", sha: "" },
    { label: "null", sha: null },
    { label: "undefined", sha: undefined },
  ])("notifies and rejects $label as a commit SHA", async ({ sha }) => {
    const client = new GitHubClient();

    const result = await client.getCommitFiles(TEST_REPO_URL, sha);

    expect(result).toStrictEqual({
      success: false,
      error: "Missing commit SHA",
      devError: { message: "getCommitFiles requires a valid commit SHA parameter" },
    });
    expect(notifications.notify).toHaveBeenCalledWith("Missing commit SHA", "error");
  });

  test("handles HTTP error responses from GitHub API", async () => {
    useFetch(createResponse({ status: 404, body: { message: "No commit found for SHA" } }));
    const client = new GitHubClient();
    const userError = "Not Found (404): Repository or resource not found.";

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA);

    expect(result).toStrictEqual({
      success: false,
      error: userError,
      devError: {
        status: 404,
        message: `${userError} [API Message: "No commit found for SHA", URL: ${COMMIT_URL}]`,
        url: COMMIT_URL,
      },
    });
    expect(notifications.notify).toHaveBeenCalledWith(userError, "error");
  });

  test("handles request cancellation via AbortSignal without notifying", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal("fetch", async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });
    const client = new GitHubClient();

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA, {
      signal: controller.signal,
    });

    expect(result).toStrictEqual({
      success: false,
      cancelled: true,
    });
    expect(notifications.notify).not.toHaveBeenCalled();
  });
});
