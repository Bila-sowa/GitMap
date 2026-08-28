const body = document.querySelector("body");
const viewport = document.querySelector("#viewport");
const canvas = document.querySelector("#canvas");
const linkInput = document.querySelector("#linkInput");
const refreshButton = document.querySelector("#refresh");
const themeButton = document.querySelector("#theme");
const settingsButton = document.querySelector("#settings");
const graph = document.querySelector("#graph");
const scaleIncreaseButton = document.querySelector("#scale-increase");
const scaleDisplay = document.querySelector("#scale-display");
const scaleDecreaseButton = document.querySelector("#scale-decrese");
let pageFocusElements = [];

const updateElements = () => {
    pageFocusElements = [...body.querySelectorAll("a"), ...body.querySelectorAll("button")];
};

export {
    body,
    pageFocusElements,
    canvas,
    viewport,
    linkInput,
    refreshButton,
    themeButton,
    settingsButton,
    graph,
    updateElements,
    scaleIncreaseButton,
    scaleDisplay,
    scaleDecreaseButton,
};
