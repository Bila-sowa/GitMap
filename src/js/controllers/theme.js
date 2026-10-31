const THEME_STATES = ["system", "dark-theme", "light-theme"];
const DEFAULT_THEME = "system";

const THEME_DETAILS = {
  system: { icon: "system", label: "System", next: "dark" },
  "dark-theme": { icon: "dark", label: "Dark", next: "light" },
  "light-theme": { icon: "light", label: "Light", next: "system" },
};

function normalizeTheme(theme) {
  return THEME_STATES.includes(theme) ? theme : DEFAULT_THEME;
}

class ThemeController {
  #button;
  #body;
  #storage;
  #localStorage;
  #themeColorMeta;
  #mediaQuery = null;
  #abortController = null;

  constructor(button, body, storage, localStorage) {
    this.#button = button;
    this.#body = body;
    this.#storage = storage;
    this.#localStorage = localStorage;
    this.#themeColorMeta = document.querySelector("#theme-color");
  }

  init() {
    this.#setTheme(this.#storage.getData().theme);
    this.#bindEvents();
    return this;
  }

  #bindEvents() {
    this.#abortController?.abort();
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    this.#button.addEventListener("click", () => this.#changeTheme(), { signal });

    const mediaQuery = this.#getMediaQuery();

    mediaQuery?.addEventListener(
      "change",
      () => {
        if (normalizeTheme(this.#storage.getData().theme) === "system") this.#applyTheme("system");
      },
      { signal },
    );
  }

  #setTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);

    this.#applyTheme(normalizedTheme);
    this.#storage.setData({ theme: normalizedTheme });
    this.#localStorage.save();
  }

  #applyTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);
    const resolvedTheme = normalizedTheme === "system" ? this.#getSystemTheme() : normalizedTheme;

    this.#body.classList.remove("dark-theme", "light-theme");
    this.#body.classList.add(resolvedTheme);
    this.#updateButton(normalizedTheme);
    this.#updateThemeColor();
  }

  #updateButton(theme) {
    const details = THEME_DETAILS[theme] || THEME_DETAILS[DEFAULT_THEME];

    this.#button.dataset.themeState = details.icon;
    this.#button.setAttribute("aria-label", `Theme: ${details.label}. Switch to ${details.next} theme.`);
    this.#button.title = `Theme: ${details.label}`;
  }

  #updateThemeColor() {
    if (!this.#themeColorMeta) return;

    const themeColor = getComputedStyle(this.#body).getPropertyValue("--color-1").trim();

    if (themeColor) this.#themeColorMeta.content = themeColor;
  }

  #getSystemTheme() {
    const mediaQuery = this.#getMediaQuery();

    if (!mediaQuery) return "dark-theme";

    return mediaQuery.matches ? "dark-theme" : "light-theme";
  }

  #getMediaQuery() {
    if (this.#mediaQuery) return this.#mediaQuery;
    if (typeof window.matchMedia !== "function") return null;

    this.#mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    return this.#mediaQuery;
  }

  #changeTheme() {
    const currentTheme = normalizeTheme(this.#storage.getData().theme);
    const currentIndex = THEME_STATES.indexOf(currentTheme);
    const nextTheme = THEME_STATES[(currentIndex + 1) % THEME_STATES.length];

    this.#setTheme(nextTheme);
  }

  destroy() {
    this.#abortController?.abort();
    this.#abortController = null;
    this.#mediaQuery = null;
  }
}

export { ThemeController };
