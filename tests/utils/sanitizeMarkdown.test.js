// @vitest-environment jsdom
import { describe, test, expect } from "vitest";
import { sanitizeMarkdown } from "@/js/utils/sanitizeMarkdown";

describe("sanitizeMarkdown", () => {
  test("removes an unsafe javascript link target", () => {
    const result = sanitizeMarkdown("[audit link](javascript:alert%281%29)");

    expect(result).toBe("<p><a>audit link</a></p>\n");
  });

  test("removes images and event handlers from raw HTML", () => {
    const result = sanitizeMarkdown('<img src="x" onerror="alert(1)">');

    expect(result).toBe("");
  });

  test("preserves safe markdown markup and HTTPS links", () => {
    const result = sanitizeMarkdown("**Safe** [link](https://example.com/audit)");

    expect(result).toBe('<p><strong>Safe</strong> <a href="https://example.com/audit">link</a></p>\n');
  });

  test.each([
    { label: "an empty string", input: "" },
    { label: "null", input: null },
    { label: "undefined", input: undefined },
  ])("returns an empty string for $label", ({ input }) => {
    const result = sanitizeMarkdown(input);

    expect(result).toBe("");
  });
});
