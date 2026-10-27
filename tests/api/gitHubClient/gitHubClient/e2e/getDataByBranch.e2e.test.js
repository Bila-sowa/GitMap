import { describe, test, expect, vi, afterEach } from "vitest";
import { GitHubClient } from "@/js/api/gitHubClient";
import notifications from "@/js/utils/notificationManager";

const TEST_REPO_URL = "https://github.com/Bila-sowa/GitMap";
const TEST_BRANCH_NAME = "main";
const HTTP_ERROR_MIN = 400;
const HTTP_ERROR_MAX = 599;

const getHttpErrorStatus = (result) => {
  const status = result.devError?.status;

  return Number.isInteger(status) && status >= HTTP_ERROR_MIN && status <= HTTP_ERROR_MAX ? status : null;
};

describe("getDataByBranch (live GitHub API)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns commit details for an existing public branch", { timeout: 20000 }, async () => {
    vi.spyOn(notifications, "notify").mockResolvedValue();
    const client = new GitHubClient();

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL);
    const httpErrorStatus = getHttpErrorStatus(result);

    if (httpErrorStatus !== null) {
      console.log(`[WARN] GitHub API error (HTTP ${httpErrorStatus}): ${result.error}`);

      expect(result.success).toBe(false);
      return;
    }

    expect(result.success, result.error).toBe(true);
    expect(Array.isArray(result.commitsDetails)).toBe(true);
    expect(result.commitsDetails.length).toBeGreaterThan(0);

    const firstCommit = result.commitsDetails[0];
    expect(typeof firstCommit.hash).toBe("string");
    expect(typeof firstCommit.sha).toBe("string");
    expect(typeof firstCommit.title).toBe("string");
    expect(typeof firstCommit.url).toBe("string");
    expect(typeof firstCommit.author).toBe("object");
    expect(typeof firstCommit.author.name).toBe("string");
    expect(typeof firstCommit.author.date).toBe("string");
    expect(Array.isArray(firstCommit.parents)).toBe(true);
  });
});
