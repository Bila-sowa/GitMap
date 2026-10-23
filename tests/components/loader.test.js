// @vitest-environment jsdom
import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import { generateLoader, removeLoader } from "@/js/components/Loader";

const createContainer = () => {
  const container = document.createElement("div");
  document.body.append(container);
  return container;
};

describe("Loader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    removeLoader(undefined, document.body);
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  test("replaces an existing loader when a new one is generated", () => {
    const container = createContainer();
    const firstLoader = generateLoader(1000, { showLoader: true, container });

    const secondLoader = generateLoader(1000, { showLoader: true, container });

    expect(firstLoader.isConnected).toBe(false);
    expect(secondLoader.isConnected).toBe(true);
  });

  test("removing the previous loader keeps the replacement", () => {
    const container = createContainer();
    const firstLoader = generateLoader(1000, { showLoader: true, container });
    const secondLoader = generateLoader(1000, { showLoader: true, container });

    removeLoader(firstLoader);

    expect(firstLoader.isConnected).toBe(false);
    expect(secondLoader.isConnected).toBe(true);
  });

  test("removes a loader manually", () => {
    const container = createContainer();
    const loader = generateLoader(1000, { showLoader: true, container });

    removeLoader(loader);

    expect(loader.isConnected).toBe(false);
  });

  test("does not run the default cleanup timeout after 20 milliseconds", () => {
    const container = createContainer();
    const loader = generateLoader(undefined, { showLoader: true, container });

    vi.advanceTimersByTime(20);

    expect(loader.isConnected).toBe(true);
  });

  test("removes a loader when its timeout expires", () => {
    const container = createContainer();
    const loader = generateLoader(10, { showLoader: true, container });

    vi.advanceTimersByTime(10);

    expect(loader.isConnected).toBe(false);
  });

  test("does not create a loader when loaders are disabled", () => {
    const container = createContainer();

    const result = generateLoader(1000, { showLoader: false, container });

    expect(result).toBeUndefined();
    expect(container.querySelector(".loader")).toBeNull();
  });
});
