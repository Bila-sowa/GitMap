import { vi } from "vitest";

export const TEST_REPO_URL = "https://github.com/Bila-sowa/GitMap";
export const PINNED_COMMIT_SHA = "46f5cd270ddda0267790caf4fe48ec8895149ec6";

export const HTTP_ERROR_MIN = 400;
export const HTTP_ERROR_MAX = 599;

/**
 * Returns the HTTP status code from a result's devError if it falls in the
 * error range, or null when the result is not an HTTP error.
 * Used in E2E tests to log a warning and skip assertions on rate-limit or
 * network failures without treating them as test failures.
 */
export const getHttpErrorStatus = (result) => {
  const status = result.devError?.status;

  return Number.isInteger(status) && status >= HTTP_ERROR_MIN && status <= HTTP_ERROR_MAX ? status : null;
};

/**
 * Builds a minimal Response-like object for mocking fetch in local tests.
 * The caller must supply the url that matches the intercepted endpoint so that
 * the response.url field is accurate and useFetch can enforce strict URL matching.
 */
export const createResponse = ({ status = 200, body = {}, url } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  url,
  headers: new Headers(),
  json: async () => body,
});

/**
 * Stubs globalThis.fetch to intercept requests to exactly one expectedUrl.
 * Any request to a different URL throws an error to catch accidental network
 * calls in the offline local test environment.
 * Returns the requests array so callers can assert which URLs were fetched.
 */
export const useFetch = (response, expectedUrl) => {
  const requests = [];

  vi.stubGlobal("fetch", async (url) => {
    requests.push(url);

    if (url !== expectedUrl) {
      throw new Error(`Unexpected request: ${url}`);
    }

    return response;
  });

  return requests;
};
