import { describe, test, expect } from "vitest";
import { Storage } from "@/js/data/storage";

describe("Storage", () => {
  test("checks the initial data", () => {
    const storage = new Storage();
    const result = storage.getData();

    expect(result).toEqual({
      link: "",
      theme: "dark-theme",
      token: "",
      localStorage: {
        saveLink: false,
        saveToken: false,
      },
    });
  });

  test("validates and sets the token", () => {
    const storage = new Storage();

    const setNonStringToken = () => storage.setData({ token: 12345 });
    expect(setNonStringToken).toThrow(TypeError);

    const setInvalidPrefixToken = () => storage.setData({ token: "invalid_token_prefix" });
    expect(setInvalidPrefixToken).toThrow(SyntaxError);

    storage.setData({ token: "ghp_classicToken123" });
    const classicResult = storage.getData().token;
    expect(classicResult).toBe("ghp_classicToken123");

    storage.setData({ token: "github_pat_fineGrainedToken456" });
    const fineGrainedResult = storage.getData().token;
    expect(fineGrainedResult).toBe("github_pat_fineGrainedToken456");

    storage.setData({ token: "" });
    const emptyResult = storage.getData().token;
    expect(emptyResult).toBe("");

    storage.setData({ token: "   " });
    const trimmedEmptyResult = storage.getData().token;
    expect(trimmedEmptyResult).toBe("");
  });

  test("sets the invalid data types", () => {
    const storage = new Storage();

    const setInvalidLink = () => storage.setData({ link: 123 });
    expect(setInvalidLink).toThrow(TypeError);

    const setInvalidSaveLink = () => storage.setData({ localStorage: { saveLink: "none" } });
    expect(setInvalidSaveLink).toThrow(TypeError);

    const setInvalidTheme = () => storage.setData({ token: "", localStorage: { saveToken: true }, theme: "bad" });
    expect(setInvalidTheme).toThrow(TypeError);

    const result = storage.getData();
    expect(result.theme).toBe("dark-theme");
    expect(result.token).toBe("");
    expect(result.localStorage.saveToken).toBe(true);
  });

  test("sets the valid data", () => {
    const storage = new Storage();

    storage.setData({
      link: "git@github.com:Bila-sowa/GitMap.git",
      theme: "light-theme",
      localStorage: {
        saveToken: false,
      },
    });

    const result = storage.getData();
    expect(result).toEqual({
      link: "git@github.com:Bila-sowa/GitMap.git",
      theme: "light-theme",
      token: "",
      localStorage: {
        saveLink: false,
        saveToken: false,
      },
    });
  });

  test("changes the data", () => {
    const storage = new Storage();

    storage.setData({ link: "git@github.com:Bila-sowa/GitMap.git" });
    storage.setData({ link: "https://github.com/Bila-sowa/GitMap.git" });

    const result = storage.getData().link;
    expect(result).toBe("https://github.com/Bila-sowa/GitMap.git");
  });

  test("resets the storage", () => {
    const storage = new Storage();

    storage.setData({
      token: "ghp_012",
      link: "",
      localStorage: {
        saveLink: true,
        saveToken: false,
      },
    });

    storage.reset();

    const result = storage.getData();
    expect(result).toEqual({
      link: "",
      theme: "dark-theme",
      token: "",
      localStorage: {
        saveLink: false,
        saveToken: false,
      },
    });
  });
});
