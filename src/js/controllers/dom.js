const body = document.querySelector("body")
const viewport = document.querySelector("#viewport");
const canvas = document.querySelector("#canvas");
const themeButton = document.querySelector("#theme")
const graph = document.querySelector("#graph")
let pageFocusElements = [];

const updateElements = () => {
    pageFocusElements = [
        ...body.querySelectorAll("a"),
        ...body.querySelectorAll("button"),
    ];
};

export {
    body,
    pageFocusElements,
    canvas,
    viewport,
    themeButton,
    graph,
    updateElements,
};
