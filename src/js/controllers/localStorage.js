class LocalStorageController {
  #storage;
  #notifications;

  constructor(storage, notifications) {
    this.#storage = storage;
    this.#notifications = notifications;
  }

  init() {
    return this.load();
  }

  destroy() {}

  save() {
    const currentData = this.#storage.getData();
    const dataToSave = {
      ...currentData,
      localStorage: { ...currentData.localStorage },
      link: currentData.localStorage.saveLink ? currentData.link : "",
      token: currentData.localStorage.saveToken ? currentData.token : "",
    };

    try {
      globalThis.localStorage.setItem("GitMap", JSON.stringify(dataToSave));
      return { success: true };
    } catch (err) {
      this.#notifications.notify("Unable to save data in local storage.", "error");
      return { error: err.name, success: false };
    }
  }

  get() {
    try {
      const value = globalThis.localStorage.getItem("GitMap");
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

  load() {
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

    if (ls.saveLink && data.link) {
      try {
        this.#storage.setData({ link: data.link });
      } catch {
        // Invalid stored link is ignored to prevent initialization failure
      }
    }

    if (ls.saveToken && data.token) {
      try {
        this.#storage.setData({ token: data.token });
      } catch {
        // Invalid stored token is ignored to prevent initialization failure
      }
    }

    return { success: true, data: this.#storage.getData() };
  }
}

export { LocalStorageController };
