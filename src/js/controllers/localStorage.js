import { decrypt, encrypt, isEncryptedValue } from "../utils/cipher.js";
import encryptionKeyStore from "../data/encryptionKeyStore.js";

const STORAGE_KEY = "GitMap";

class LocalStorageController {
  #storage;
  #notifications;
  #keyStore;
  #writeQueue = Promise.resolve();

  constructor(storage, notifications, keyStore = encryptionKeyStore) {
    this.#storage = storage;
    this.#notifications = notifications;
    this.#keyStore = keyStore;
  }

  async init() {
    return await this.load();
  }

  destroy() {}

  async save() {
    return await this.#enqueue(async () => {
      const currentData = this.#storage.getData();
      const encrypted = await this.#encryptToken(currentData);

      if (!encrypted.success) return { error: encrypted.error, success: false };

      const dataToSave = {
        ...currentData,
        localStorage: { ...currentData.localStorage },
        link: currentData.localStorage.saveLink ? currentData.link : "",
        token: encrypted.token,
      };

      try {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        return { success: true };
      } catch (err) {
        this.#notifications.notify("Unable to save data in local storage.", "error");
        return { error: err.name, success: false };
      }
    });
  }

  get() {
    try {
      const value = globalThis.localStorage.getItem(STORAGE_KEY);
      let parse = {};

      if (value) parse = JSON.parse(value);

      if (!parse || typeof parse !== "object" || Array.isArray(parse)) {
        return { data: {}, success: false };
      }

      return { data: parse, success: true };
    } catch (err) {
      this.#notifications.notify(
        "Invalid local storage parse. Please check your data in the local storage or delete its data.",
        "error",
      );
      return { error: err.name, success: false };
    }
  }

  async load() {
    const result = this.get();
    if (!result.success || !result.data || !Object.keys(result.data).length) {
      return { success: false, data: null };
    }

    const data = result.data;
    const update = {};

    if (data.theme) update.theme = data.theme;
    if (data.localStorage) update.localStorage = data.localStorage;

    if (Object.keys(update).length) {
      try {
        this.#storage.setData(update);
      } catch {
        // Invalid stored values (e.g. unknown theme) are silently ignored;
        // setData applies what it can before throwing, so partial updates take effect.
      }
    }

    const { localStorage: ls } = this.#storage.getData();
    let shouldRewrite = false;

    if (ls.saveLink && data.link) {
      try {
        this.#storage.setData({ link: data.link });
      } catch {
        // Invalid stored link is ignored to prevent initialization failure
      }
    }

    if (ls.saveToken && data.token) {
      const token = await this.#decryptToken(data.token);

      if (token === null) {
        shouldRewrite = true;
      } else {
        try {
          this.#storage.setData({ token });
        } catch {
          shouldRewrite = true;
        }

        if (!isEncryptedValue(data.token)) shouldRewrite = true;
      }
    } else if (data.token) {
      shouldRewrite = true;
    }

    if (shouldRewrite) await this.save();

    return { success: true, data: this.#storage.getData() };
  }

  async #encryptToken(currentData) {
    if (!currentData.localStorage.saveToken || !currentData.token) return { success: true, token: "" };

    try {
      const key = await this.#keyStore.getKey();

      return { success: true, token: await encrypt(currentData.token, key) };
    } catch (err) {
      this.#notifications.notify("Unable to encrypt the token for local storage.", "error");
      this.#removePlaintextToken();
      return { error: err.name, success: false, token: "" };
    }
  }

  #removePlaintextToken() {
    const stored = this.get();

    if (!stored.success || !stored.data || !stored.data.token || isEncryptedValue(stored.data.token)) return;

    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored.data, token: "" }));
    } catch {
      // The failed save already reports the storage error to the user.
    }
  }

  async #decryptToken(storedToken) {
    if (typeof storedToken === "string") return storedToken;

    if (!isEncryptedValue(storedToken)) {
      this.#notifications.notify("Invalid saved token data. Please enter the token again.", "error");
      return null;
    }

    try {
      const key = await this.#keyStore.getKey();

      return await decrypt(storedToken, key);
    } catch (err) {
      console.error("Failed to decrypt the saved token:", err);
      this.#notifications.notify("Unable to decrypt the saved token. Please enter the token again.", "error");
      return null;
    }
  }

  #enqueue(task) {
    const result = this.#writeQueue.then(task, task);

    this.#writeQueue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }
}

export { LocalStorageController };
