import styles from "./styles.module.scss"

function generateLoader() {
    const loaders = [...document.querySelectorAll(".loader")];

    if (loaders.length) removeLoader();

    const loaderHTML = `
        <div class="overlay loader">
            <div class="${styles.loader}" role="status" aria-label="Loading">
                <div class="${styles['loader-bar']}"></div>
                <div class="${styles['loader-bar']}"></div>
                <div class="${styles['loader-bar']}"></div>
                <div class="${styles['loader-bar']}"></div>
                <div class="${styles['loader-bar']}"></div>
            </div>
        </div>
    `

    document.body.insertAdjacentHTML("beforeend", loaderHTML);
}

function removeLoader() {
    [...document.querySelectorAll(".loader")].forEach(loader => loader.remove());
}

export { generateLoader, removeLoader };
