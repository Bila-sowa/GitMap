import * as DOM from "./controllers/dom.js";

import { Input, Refresh, Theme, Settings } from "./controllers/menu.js";
import Graph from "./controllers/graph.js";
import Canvas from './controllers/canvas.js';


const graph = new Graph(DOM.graph);
const canvas = new Canvas(DOM.viewport, DOM.canvas);
const linkInput = new Input(DOM.linkInput, graph);
const theme = new Theme(DOM.themeButton);
const refresh = new Refresh(DOM.refreshButton, graph);
const settings = new Settings(DOM.settingsButton);
