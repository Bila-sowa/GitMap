import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { GitHubClient } from "@/js/api/gitHubClient";
import notifications from "@/js/utils/notificationManager";

const RATE_LIMIT_URL = "https://api.github.com/rate_limit";
const EMPTY_RATE_LIMIT_DATA = { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 };

const createResponse = ({ status = 200, body = {} } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  url: RATE_LIMIT_URL,
  headers: new Headers(),
  json: async () => body,
});

const useFetch = (response) => {
  const requests = [];
  const fetcher = async (url) => {
    requests.push(url);

    if (url !== RATE_LIMIT_URL) {
      throw new Error(`Unexpected request: ${url}`);
    }

    return response;
  };

  vi.stubGlobal("fetch", fetcher);
  return requests;
};

describe("getRateLimitData", () => {
  beforeEach(() => {
    vi.spyOn(notifications, "notify").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("parses the core rate limit and computes the used percentage", async () => {
    const requests = useFetch(
      createResponse({ body: { resources: { core: { limit: 60, remaining: 47, used: 13 } } } }),
    );
    const client = new GitHubClient();

    const result = await client.getRateLimitData();

    expect(result).toStrictEqual({
      success: true,
      data: { limitPerNumber: 60, usedPerNumber: 13, usedPerPercent: 21.67 },
    });
    expect(requests).toStrictEqual([RATE_LIMIT_URL]);
    expect(notifications.notify).not.toHaveBeenCalled();
  });

  test("derives the used count from the remaining count", async () => {
    useFetch(createResponse({ body: { resources: { core: { limit: 60, remaining: 45 } } } }));
    const client = new GitHubClient();

    const result = await client.getRateLimitData();

    expect(result).toStrictEqual({
      success: true,
      data: { limitPerNumber: 60, usedPerNumber: 15, usedPerPercent: 25 },
    });
  });

  test("warns when the used percentage reaches the warning threshold", async () => {
    useFetch(createResponse({ body: { resources: { core: { limit: 60, remaining: 18, used: 42 } } } }));
    const client = new GitHubClient();

    const result = await client.getRateLimitData();

    expect(result).toStrictEqual({
      success: true,
      data: { limitPerNumber: 60, usedPerNumber: 42, usedPerPercent: 70 },
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      "GitHub API rate limit is above 70%. Consider reducing request volume or adding a personal access token.",
      "warning",
    );
  });

  test("returns empty data when resources.core is missing", async () => {
    const body = { resources: { search: { limit: 10, remaining: 10 } } };
    useFetch(createResponse({ body }));
    const client = new GitHubClient();

    const result = await client.getRateLimitData();

    expect(result).toStrictEqual({
      success: false,
      error: "Invalid rate limit response format",
      devError: {
        message: "Missing data.resources.core in GitHub rate_limit response",
        rawResponse: body,
      },
      data: EMPTY_RATE_LIMIT_DATA,
    });
    expect(notifications.notify).toHaveBeenCalledWith("Invalid rate limit response format", "error");
  });

  test("returns empty data when the HTTP request fails", async () => {
    useFetch(createResponse({ status: 403, body: { message: "API rate limit exceeded" } }));
    const client = new GitHubClient();
    const userError = "Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.";

    const result = await client.getRateLimitData();

    expect(result).toStrictEqual({
      success: false,
      error: userError,
      devError: {
        status: 403,
        message: `${userError} [API Message: "API rate limit exceeded", URL: ${RATE_LIMIT_URL}]`,
        url: RATE_LIMIT_URL,
      },
      data: EMPTY_RATE_LIMIT_DATA,
    });
    expect(notifications.notify).toHaveBeenCalledWith(userError, "error");
  });
});
