import * as DOM from "./controllers/dom.js";
import { renderGraph } from './controllers/render.js';

import { Theme } from "./controllers/menu.js";
import Graph from "./controllers/graph.js";
import Canvas from './controllers/canvas.js';


const graph = new Graph(DOM.graph);
const canvas = new Canvas(DOM.viewport, DOM.canvas);
const theme = new Theme(DOM.themeButton)

// For Testing
graph.render("https://github.com/Bila-sowa/Area");
