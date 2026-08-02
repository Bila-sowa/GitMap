const body = document.querySelector("body")
const viewport = document.querySelector('.viewport');
const canvas = document.querySelector('.canvas');
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
    graph,
    updateElements,
};
