import { afterAll, afterEach, expect, vi } from "vitest";

const originalFetch = globalThis.fetch;
const unexpectedRequests = [];
const blockFetch = (input) => {
    unexpectedRequests.push(String(input));
    throw new Error("Unexpected network request in a local test.");
};

globalThis.fetch = blockFetch;

afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = blockFetch;

    const result = unexpectedRequests.splice(0);
    expect(result).toEqual([]);
});

afterAll(() => {
    const result = unexpectedRequests.splice(0);
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
    expect(result).toEqual([]);
});
