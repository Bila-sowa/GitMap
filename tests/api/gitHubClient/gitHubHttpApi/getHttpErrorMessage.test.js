import { describe, test, expect } from "vitest";
import GitHubHttpApi from "@/js/api/gitHubClient/gitHubHttpApi";

describe("getHttpErrorMessage", () => {
  const gitHubHttpApi = new GitHubHttpApi();

  test("handles the empty http code", () => {
    const result = gitHubHttpApi.getHttpErrorMessage("");
    expect(result).toBe(null);
  });

  test.each([
    { code: 96, expected: null },
    { code: 691, expected: null },
    { code: "404", expected: null },
    { code: 201.2, expected: null },
  ])("handles uncorrect http code: ${code}", ({ code, expected }) => {
    const result = gitHubHttpApi.getHttpErrorMessage(code);
    expect(result).toBe(expected);
  });

  test("returns the user message for http status: 404", () => {
    const result = gitHubHttpApi.getHttpErrorMessage(404);
    expect(result).toBe("Not Found (404): Repository or resource not found.");
  });

  test("falls back to a generic message for an unmapped http status: 402", () => {
    const result = gitHubHttpApi.getHttpErrorMessage(402);
    expect(result).toBe("GitHub API error (HTTP 402).");
  });
});
