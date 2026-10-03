import { config } from "@/js/api/config";
import styles from "./styles.module.scss";

const loaderTimeouts = new WeakMap();

function generateLoader(timeout = config.loader.CLEANUP_TIMEOUT_MS, options = {}) {
    const { showLoader = config.loader.showLoader, container = document.body } = options;
    if (!showLoader) return;

    removeLoader(undefined, container);

    const loader = document.createElement("div");
    loader.className = "overlay loader";
    loader.innerHTML = `
        <div class="${styles.loader}" role="status" aria-label="Loading">
            <div class="${styles["loader-bar"]}"></div>
            <div class="${styles["loader-bar"]}"></div>
            <div class="${styles["loader-bar"]}"></div>
            <div class="${styles["loader-bar"]}"></div>
            <div class="${styles["loader-bar"]}"></div>
        </div>
    `;

    container.append(loader);
    loaderTimeouts.set(
        loader,
        setTimeout(() => removeLoader(loader), timeout),
    );

    return loader;
}

function removeLoader(loader, container) {
    const loaders = loader ? [loader] : [...(container || document.body).querySelectorAll(".loader")];

    loaders.forEach((loaderElement) => {
        const timeout = loaderTimeouts.get(loaderElement);
        if (timeout) clearTimeout(timeout);

        loaderTimeouts.delete(loaderElement);
        loaderElement.remove();
    });
}

export { generateLoader, removeLoader };
