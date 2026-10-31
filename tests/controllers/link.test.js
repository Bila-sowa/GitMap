// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { config } from "@/js/api/config";
import { LinkController } from "@/js/controllers/link";
import { Storage } from "@/js/data/storage";

let activeController = null;

function createController({ history = [], renderResult = { success: true } } = {}) {
  const container = document.createElement("div");
  container.className = "link-history-container";

  const input = document.createElement("input");
  input.id = "linkInput";
  input.type = "text";

  const list = document.createElement("ul");
  list.id = "link-history-list";
  list.className = "link-history hidden";

  container.append(input, list);
  document.body.append(container);

  const storage = new Storage();
  storage.setData({ history, localStorage: { saveLink: false, saveToken: false } });

  const graph = { render: vi.fn(async () => renderResult) };
  const localStorage = { save: vi.fn(async () => ({ success: true })) };
  const controller = new LinkController(input, container, list, graph, storage, localStorage);

  controller.init();
  activeController = controller;

  return { container, input, list, storage, graph, localStorage, controller };
}

function getItems(list) {
  return [...list.querySelectorAll(".link-history-item")];
}

function selectFirstItem(list) {
  const item = getItems(list)[0];

  item.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, cancelable: true }));
}

describe("LinkController history", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    activeController?.destroy();
    activeController = null;
    document.body.innerHTML = "";
  });

  test("renders stored history and keeps the list hidden initially", () => {
    const { list } = createController({
      history: ["https://github.com/example/one", "https://github.com/example/two"],
    });
    const items = getItems(list);

    expect(items.map((item) => item.textContent)).toStrictEqual([
      "https://github.com/example/one",
      "https://github.com/example/two",
    ]);
    expect(list.classList.contains("hidden")).toBe(true);
  });

  test("opens on hover and keeps the list open after mouse leave", () => {
    const { container, list } = createController({ history: ["https://github.com/example/one"] });

    container.dispatchEvent(new MouseEvent("mouseenter"));
    const opened = list.classList.contains("hidden");

    container.dispatchEvent(new MouseEvent("mouseleave"));
    const afterLeave = list.classList.contains("hidden");

    expect(opened).toBe(false);
    expect(afterLeave).toBe(false);
  });

  test("keeps the list open on mouse leave while the input is focused", () => {
    const { container, input, list } = createController({ history: ["https://github.com/example/one"] });

    input.focus();
    container.dispatchEvent(new MouseEvent("mouseenter"));
    container.dispatchEvent(new MouseEvent("mouseleave"));

    expect(list.classList.contains("hidden")).toBe(false);
  });

  test("hides the list after the configured delay on mouse leave", () => {
    vi.useFakeTimers();

    try {
      const { container, list } = createController({ history: ["https://github.com/example/one"] });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(4999);
      const beforeDelay = list.classList.contains("hidden");
      vi.advanceTimersByTime(1);
      const afterDelay = list.classList.contains("hidden");

      expect(beforeDelay).toBe(false);
      expect(afterDelay).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  test("cancels the hide delay when the pointer returns", () => {
    vi.useFakeTimers();

    try {
      const { container, list } = createController({ history: ["https://github.com/example/one"] });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(4000);
      container.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(5000);

      expect(list.classList.contains("hidden")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  test("uses the configured hide delay", () => {
    const originalDelay = config.linkHistory.HIDE_DELAY_MS;

    config.linkHistory.HIDE_DELAY_MS = 1000;
    vi.useFakeTimers();

    try {
      const { container, list } = createController({ history: ["https://github.com/example/one"] });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));
      vi.advanceTimersByTime(999);
      const beforeDelay = list.classList.contains("hidden");
      vi.advanceTimersByTime(1);
      const afterDelay = list.classList.contains("hidden");

      expect(beforeDelay).toBe(false);
      expect(afterDelay).toBe(true);
    } finally {
      vi.useRealTimers();
      config.linkHistory.HIDE_DELAY_MS = originalDelay;
    }
  });

  test("closes the list when the user types", () => {
    const { input, list } = createController({ history: ["https://github.com/example/one"] });

    input.focus();
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(list.classList.contains("hidden")).toBe(true);
  });

  test("does not open when history is empty", () => {
    const { container, list } = createController();

    container.dispatchEvent(new MouseEvent("mouseenter"));

    expect(list.classList.contains("hidden")).toBe(true);
  });

  test("fills the input on selection without rendering", () => {
    const { container, input, list, graph } = createController({
      history: ["https://github.com/example/one"],
    });

    container.dispatchEvent(new MouseEvent("mouseenter"));
    selectFirstItem(list);

    expect(input.value).toBe("https://github.com/example/one");
    expect(graph.render).not.toHaveBeenCalled();
    expect(list.classList.contains("hidden")).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  test("renders after the input loses focus following a selection", async () => {
    const { container, input, list, graph, storage, localStorage } = createController({
      history: ["https://github.com/example/one"],
    });

    container.dispatchEvent(new MouseEvent("mouseenter"));
    selectFirstItem(list);
    await Promise.resolve();
    input.dispatchEvent(new FocusEvent("blur"));

    await vi.waitFor(() => expect(graph.render).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(localStorage.save).toHaveBeenCalledTimes(1));

    expect(storage.getData().history).toStrictEqual(["https://github.com/example/one"]);
  });

  test("renders on Enter after a selection", async () => {
    const { container, input, list, graph } = createController({
      history: ["https://github.com/example/one"],
    });

    container.dispatchEvent(new MouseEvent("mouseenter"));
    selectFirstItem(list);
    await Promise.resolve();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    await vi.waitFor(() => expect(graph.render).toHaveBeenCalledTimes(1));

    expect(input.value).toBe("https://github.com/example/one");
  });

  test("records a successful repository in history and saves it", async () => {
    const { input, graph, storage, localStorage } = createController();

    input.value = "https://github.com/example/project";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    await vi.waitFor(() => expect(graph.render).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(storage.getData().history).toStrictEqual(["https://github.com/example/project"]));
    await vi.waitFor(() => expect(localStorage.save).toHaveBeenCalledTimes(1));
  });

  test("does not record a failed render", async () => {
    const { input, graph, storage, localStorage } = createController({
      renderResult: { success: false },
    });

    input.value = "https://github.com/example/project";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    await vi.waitFor(() => expect(graph.render).toHaveBeenCalledTimes(1));

    expect(storage.getData().history).toStrictEqual([]);
    expect(localStorage.save).not.toHaveBeenCalled();
  });

  test("navigates history with the keyboard", () => {
    const { input, list } = createController({
      history: ["https://github.com/example/one", "https://github.com/example/two"],
    });

    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));

    expect(input.getAttribute("aria-activedescendant")).toBe("link-history-option-0");

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(input.value).toBe("https://github.com/example/one");
    expect(list.classList.contains("hidden")).toBe(true);
  });

  test("renders history links as text", () => {
    const malicious = "<img src=x onerror=alert(1)>";
    const { list } = createController({ history: [malicious] });
    const [item] = getItems(list);

    expect(item.textContent).toBe(malicious);
    expect(item.querySelector("img")).toBe(null);
  });
});
