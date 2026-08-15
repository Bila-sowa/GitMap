import '../styles.scss';
import * as DOM from "./controllers/dom.js";
import storage from "./data/storage.js";

import { Input, Refresh, Theme } from "./controllers/menu.js";
import SettingsController from './controllers/settings.js';
import Graph from "./controllers/graph.js";
import Canvas from './controllers/canvas.js';
import LocalStorage from "./controllers/localStorage.js";

const persistence = new LocalStorage();
persistence.load();

const graph = new Graph(DOM.graph);
const canvas = new Canvas(DOM.viewport, DOM.canvas);
const linkInput = new Input(DOM.linkInput, graph);
const theme = new Theme(DOM.themeButton);
const refresh = new Refresh(DOM.refreshButton, graph);
const settings = new SettingsController(DOM.settingsButton);

if (storage.link) {
    graph.render();
}
