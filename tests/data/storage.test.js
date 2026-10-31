import { describe, test, expect } from "vitest";
import { Storage } from "@/js/data/storage";

const DEFAULT_DATA = {
  link: "",
  theme: "system",
  token: "",
  history: [],
  localStorage: {
    saveLink: false,
    saveToken: false,
  },
};

class Settings {}

describe("Storage", () => {
  test("returns default settings and detached snapshots", () => {
    const storage = new Storage();
    const first = storage.getData();

    expect(first).toStrictEqual(DEFAULT_DATA);

    first.link = "https://github.com/example/project";
    first.localStorage.saveLink = true;

    const second = storage.getData();

    expect(second).toStrictEqual(DEFAULT_DATA);
    expect(first).not.toBe(second);
  });

  test.each([
    { label: "null", update: null },
    { label: "an array", update: [] },
    { label: "a string", update: "link" },
    { label: "a number", update: 42 },
    { label: "a boolean", update: true },
    { label: "a function", update: () => {} },
    { label: "a non-string link", update: { link: 42 } },
    { label: "a non-string token", update: { token: null } },
    { label: "a non-string theme", update: { theme: {} } },
    { label: "a non-array history", update: { history: "link" } },
    { label: "a non-string history item", update: { history: [42] } },
    { label: "a non-object localStorage", update: { localStorage: null } },
    { label: "an array localStorage", update: { localStorage: [] } },
    { label: "a non-boolean saveLink", update: { localStorage: { saveLink: "true" } } },
    { label: "a non-boolean saveToken", update: { localStorage: { saveToken: 1 } } },
  ])("rejects $label as an invalid update", ({ update }) => {
    const storage = new Storage();

    const result = () => storage.setData(update);

    expect(result).toThrow(TypeError);
    expect(storage.getData()).toStrictEqual(DEFAULT_DATA);
  });

  test("trims link and token values and clears empty strings", () => {
    const storage = new Storage();

    storage.setData({
      link: "  https://github.com/example/project  ",
      token: "  ghp_abc  ",
    });

    const trimmed = storage.getData();

    expect(trimmed.link).toBe("https://github.com/example/project");
    expect(trimmed.token).toBe("ghp_abc");

    storage.setData({ link: "   ", token: "   " });

    const cleared = storage.getData();

    expect(cleared.link).toBe("");
    expect(cleared.token).toBe("");
  });

  test("stores up to three trimmed history links", () => {
    const storage = new Storage();

    storage.setData({
      history: [
        "  https://github.com/example/project  ",
        "https://github.com/example/second",
        "https://github.com/example/third",
        "https://github.com/example/fourth",
      ],
    });

    const result = storage.getData().history;

    expect(result).toStrictEqual([
      "https://github.com/example/project",
      "https://github.com/example/second",
      "https://github.com/example/third",
    ]);
  });

  test("returns a detached history snapshot", () => {
    const storage = new Storage();

    storage.setData({ history: ["https://github.com/example/project"] });

    const first = storage.getData();
    first.history.push("https://github.com/example/other");

    const second = storage.getData();

    expect(second.history).toStrictEqual(["https://github.com/example/project"]);
  });

  test("updates localStorage flags independently", () => {
    const storage = new Storage();

    storage.setData({ localStorage: { saveLink: true } });
    const afterSaveLink = storage.getData().localStorage;

    expect(afterSaveLink).toStrictEqual({ saveLink: true, saveToken: false });

    storage.setData({ localStorage: { saveToken: true } });
    const afterSaveToken = storage.getData().localStorage;

    expect(afterSaveToken).toStrictEqual({ saveLink: true, saveToken: true });

    storage.setData({ localStorage: { saveLink: false } });
    const afterDisable = storage.getData().localStorage;

    expect(afterDisable).toStrictEqual({ saveLink: false, saveToken: true });

    storage.setData({ localStorage: {} });
    const afterEmptyUpdate = storage.getData().localStorage;

    expect(afterEmptyUpdate).toStrictEqual({ saveLink: false, saveToken: true });
  });

  test("applies valid fields before a later field fails", () => {
    const storage = new Storage();

    const localStorageResult = () => storage.setData({ localStorage: { saveLink: true, saveToken: "yes" } });

    expect(localStorageResult).toThrow(TypeError);
    expect(storage.getData().localStorage).toStrictEqual({ saveLink: true, saveToken: false });

    const themeResult = () =>
      storage.setData({ token: "  ghp_next  ", localStorage: { saveToken: true }, theme: "unknown" });

    expect(themeResult).toThrow(TypeError);

    const result = storage.getData();

    expect(result.token).toBe("ghp_next");
    expect(result.localStorage).toStrictEqual({ saveLink: true, saveToken: true });
    expect(result.theme).toBe("system");
  });

  test.each(["system", "dark-theme", "light-theme"])("accepts the %s theme", (theme) => {
    const storage = new Storage();

    storage.setData({ theme });

    expect(storage.getData().theme).toBe(theme);
  });

  test("applies a complete settings update in one call", () => {
    const storage = new Storage();

    storage.setData({
      link: "  https://github.com/example/project  ",
      token: "  ghp_completeToken  ",
      theme: "light-theme",
      history: ["  https://github.com/example/project  ", "https://github.com/example/other"],
      localStorage: { saveLink: true, saveToken: true },
    });

    const result = storage.getData();

    expect(result).toStrictEqual({
      link: "https://github.com/example/project",
      theme: "light-theme",
      token: "ghp_completeToken",
      history: ["https://github.com/example/project", "https://github.com/example/other"],
      localStorage: { saveLink: true, saveToken: true },
    });
  });

  test("resets every setting after changes and failed updates", () => {
    const storage = new Storage();

    storage.setData({
      link: "https://github.com/example/project",
      token: "ghp_token",
      theme: "light-theme",
      history: ["https://github.com/example/project"],
      localStorage: { saveLink: true, saveToken: true },
    });

    const result = () => storage.setData({ token: "  ghp_next  ", theme: "unknown" });

    expect(result).toThrow(TypeError);

    storage.reset();

    expect(storage.getData()).toStrictEqual(DEFAULT_DATA);
  });

  test.each([
    { label: "a Date", update: new Date() },
    { label: "a Map", update: new Map() },
    { label: "a class instance", update: new Settings() },
  ])("rejects $label as an update payload", ({ update }) => {
    const storage = new Storage();

    const result = () => storage.setData(update);

    expect(result).toThrow(TypeError);
    expect(storage.getData()).toStrictEqual(DEFAULT_DATA);
  });
});
