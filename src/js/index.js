import * as DOM from "./controllers/dom.js";
import { renderGraph } from './controllers/render.js';

import { Input, Refresh, Theme } from "./controllers/menu.js";
import Graph from "./controllers/graph.js";
import Canvas from './controllers/canvas.js';


const graph = new Graph(DOM.graph);
const canvas = new Canvas(DOM.viewport, DOM.canvas);
const linkInput = new Input(DOM.linkInput, graph)
console.log(linkInput, DOM.linkInput, graph)
const theme = new Theme(DOM.themeButton)
const refresh = new Refresh(DOM.refreshButton, graph)

// For Testing
