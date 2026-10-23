import { expect } from "vitest";

const expectInvalidParserResult = (result, method, rawResponse) => {
  expect(result).toStrictEqual({
    success: false,
    error: "Unexpected response format from GitHub",
    devError: {
      message: `Invalid response data in ${method}`,
      rawResponse,
    },
  });
};

export { expectInvalidParserResult };
