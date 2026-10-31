import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { LocalStorageController } from "@/js/controllers/localStorage";
import { Storage } from "@/js/data/storage";
import { decrypt, generateKey, isEncryptedValue } from "@/js/utils/cipher";

const notifications = { notify: vi.fn() };

function createFakeLocalStorage() {
  const values = new Map();

  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}

function readStoredData() {
  return JSON.parse(globalThis.localStorage.getItem("GitMap"));
}

describe("LocalStorageController", () => {
  let key;
  let keyStore;
  let storage;
  let controller;

  beforeEach(async () => {
    vi.stubGlobal("localStorage", createFakeLocalStorage());
    vi.spyOn(console, "error").mockImplementation(() => {});
    notifications.notify.mockReset();

    key = await generateKey();
    keyStore = {
      getKey: vi.fn(async () => key),
      deleteKey: vi.fn(async () => {}),
    };
    storage = new Storage();
    controller = new LocalStorageController(storage, notifications, keyStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("saves the token as ciphertext", async () => {
    storage.setData({ token: "ghp_secretToken", localStorage: { saveToken: true } });

    const result = await controller.save();
    const stored = readStoredData();
    const decrypted = await decrypt(stored.token, key);

    expect(result).toStrictEqual({ success: true });
    expect(isEncryptedValue(stored.token)).toBe(true);
    expect(JSON.stringify(stored)).not.toContain("ghp_secretToken");
    expect(decrypted).toBe("ghp_secretToken");
  });

  test("loads and decrypts a saved token", async () => {
    storage.setData({ token: "ghp_secretToken", localStorage: { saveToken: true } });
    await controller.save();

    const restoredStorage = new Storage();
    const restored = new LocalStorageController(restoredStorage, notifications, keyStore);
    const result = await restored.init();

    expect(result.data.token).toBe("ghp_secretToken");
  });

  test("persists repository history independently of the saved link", async () => {
    storage.setData({
      history: ["https://github.com/example/project"],
      localStorage: { saveLink: false, saveToken: false },
    });

    const result = await controller.save();
    const stored = readStoredData();

    expect(result).toStrictEqual({ success: true });
    expect(stored.link).toBe("");
    expect(stored.history).toStrictEqual(["https://github.com/example/project"]);
  });

  test("loads repository history", async () => {
    storage.setData({
      history: ["https://github.com/example/project"],
      localStorage: { saveLink: false, saveToken: false },
    });
    await controller.save();

    const restoredStorage = new Storage();
    const restored = new LocalStorageController(restoredStorage, notifications, keyStore);
    const result = await restored.init();

    expect(result.data.history).toStrictEqual(["https://github.com/example/project"]);
  });

  test("persists the system theme", async () => {
    storage.setData({ theme: "system", localStorage: { saveLink: false, saveToken: false } });

    await controller.save();

    const restoredStorage = new Storage();
    const restored = new LocalStorageController(restoredStorage, notifications, keyStore);
    const result = await restored.init();

    expect(result.data.theme).toBe("system");
  });

  test("migrates a legacy plaintext token", async () => {
    globalThis.localStorage.setItem(
      "GitMap",
      JSON.stringify({ token: "ghp_legacyToken", localStorage: { saveToken: true, saveLink: false } }),
    );

    const result = await controller.init();
    const stored = readStoredData();

    expect(result.data.token).toBe("ghp_legacyToken");
    expect(isEncryptedValue(stored.token)).toBe(true);
  });

  test("removes a saved token when saving is disabled", async () => {
    globalThis.localStorage.setItem(
      "GitMap",
      JSON.stringify({ token: "ghp_legacyToken", localStorage: { saveToken: false, saveLink: false } }),
    );

    const result = await controller.init();
    const stored = readStoredData();

    expect(result.data.token).toBe("");
    expect(stored.token).toBe("");
  });

  test("discards an undecryptable token", async () => {
    globalThis.localStorage.setItem(
      "GitMap",
      JSON.stringify({
        token: { v: 1, iv: "AAAAAAAAAAAAAAAA", data: "AAAA" },
        localStorage: { saveToken: true, saveLink: false },
      }),
    );

    const result = await controller.init();
    const stored = readStoredData();

    expect(result.data.token).toBe("");
    expect(stored.token).toBe("");
    expect(notifications.notify).toHaveBeenCalledWith(
      "Unable to decrypt the saved token. Please enter the token again.",
      "error",
    );
  });

  test("does not write plaintext when encryption fails", async () => {
    keyStore.getKey.mockRejectedValue(new Error("IndexedDB is not available"));
    storage.setData({ token: "ghp_secretToken", localStorage: { saveToken: true } });

    const result = await controller.save();

    expect(result).toStrictEqual({ error: "Error", success: false });
    expect(globalThis.localStorage.getItem("GitMap")).toBe(null);
    expect(notifications.notify).toHaveBeenCalledWith("Unable to encrypt the token for local storage.", "error");
  });

  test("removes a legacy plaintext token when encryption fails", async () => {
    keyStore.getKey.mockRejectedValue(new Error("IndexedDB is not available"));
    globalThis.localStorage.setItem(
      "GitMap",
      JSON.stringify({ token: "ghp_legacyToken", localStorage: { saveToken: true, saveLink: false } }),
    );

    const result = await controller.init();
    const stored = readStoredData();

    expect(result.data.token).toBe("ghp_legacyToken");
    expect(stored.token).toBe("");
    expect(notifications.notify).toHaveBeenCalledWith("Unable to encrypt the token for local storage.", "error");
  });

  test("does not store the token when saving is disabled", async () => {
    storage.setData({ token: "ghp_secretToken", localStorage: { saveToken: false } });

    const result = await controller.save();
    const stored = readStoredData();

    expect(result).toStrictEqual({ success: true });
    expect(stored.token).toBe("");
  });

  test("serializes concurrent saves so the latest state wins", async () => {
    storage.setData({ token: "ghp_firstToken", localStorage: { saveToken: true } });

    const first = controller.save();
    await Promise.resolve();
    storage.setData({ token: "ghp_secondToken" });
    const second = controller.save();

    await Promise.all([first, second]);

    const stored = readStoredData();
    const decrypted = await decrypt(stored.token, key);

    expect(decrypted).toBe("ghp_secondToken");
  });

  test("returns no data when storage is empty", async () => {
    const result = await controller.init();

    expect(result).toStrictEqual({ success: false, data: null });
  });
});
