class Storage {
  #link = "";
  #theme = "dark-theme";
  #token = "";
  #localStorage = {
    saveLink: false,
    saveToken: false,
  };

  getData() {
    return {
      link: this.#link,
      theme: this.#theme,
      token: this.#token,
      localStorage: { ...this.#localStorage },
    };
  }

  setData(data = {}) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      throw new TypeError("setData: expected a plain object");
    }

    if (data.link !== undefined) {
      if (typeof data.link !== "string") {
        throw new TypeError(`setData: link must be a string, got ${typeof data.link}`);
      }
      this.#link = data.link.trim();
    }

    if (data.token !== undefined) {
      if (typeof data.token !== "string") {
        throw new TypeError(`setData: token must be a string, got ${typeof data.token}`);
      }

      const trimmedToken = data.token.trim();

      if (trimmedToken !== "" && !trimmedToken.startsWith("ghp_") && !trimmedToken.startsWith("github_pat_")) {
        throw new SyntaxError('setData: token must start with "ghp_" or "github_pat_"');
      }
      this.#token = trimmedToken;
    }

    if (data.localStorage !== undefined) {
      if (data.localStorage === null || typeof data.localStorage !== "object" || Array.isArray(data.localStorage)) {
        throw new TypeError("setData: localStorage must be a plain object");
      }

      const { saveLink, saveToken } = data.localStorage;

      if (saveLink !== undefined) {
        if (typeof saveLink !== "boolean") {
          throw new TypeError(`setData: localStorage.saveLink must be a boolean, got ${typeof saveLink}`);
        }
        this.#localStorage.saveLink = saveLink;
      }
      if (saveToken !== undefined) {
        if (typeof saveToken !== "boolean") {
          throw new TypeError(`setData: localStorage.saveToken must be a boolean, got ${typeof saveToken}`);
        }
        this.#localStorage.saveToken = saveToken;
      }
    }

    if (data.theme !== undefined) {
      const isValid = data.theme === "light-theme" || data.theme === "dark-theme";
      this.#theme = isValid ? data.theme : "dark-theme";
      if (!isValid) {
        throw new TypeError(`setData: invalid theme "${data.theme}", expected "light-theme" or "dark-theme"`);
      }
    }
  }

  reset() {
    this.#link = "";
    this.#theme = "dark-theme";
    this.#token = "";
    this.#localStorage = {
      saveLink: false,
      saveToken: false,
    };
  }
}

const storage = new Storage();
export { Storage };
export default storage;
