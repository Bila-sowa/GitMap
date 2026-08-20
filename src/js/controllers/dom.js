const body = document.querySelector("body");
const viewport = document.querySelector("#viewport");
const canvas = document.querySelector("#canvas");
const linkInput = document.querySelector("#linkInput");
const refreshButton = document.querySelector("#refresh");
const themeButton = document.querySelector("#theme");
const settingsButton = document.querySelector("#settings");
const graph = document.querySelector("#graph");
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
};
