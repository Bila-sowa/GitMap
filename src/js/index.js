import '../styles.scss';
import * as DOM from "./controllers/dom.js";
import storage from "./data/storage.js";

import GraphController from "./controllers/graph.js";
import CanvasController from './controllers/canvas.js';
import SettingsController from './controllers/settings.js';
import LinkController from './controllers/link';
import ThemeController from './controllers/theme';
import RefreshButtonController from './controllers/refresh';

import LocalStorageController from "./controllers/localStorage.js";
const persistence = new LocalStorageController();
persistence.load();

const graph = new GraphController(DOM.graph);
const canvas = new CanvasController(DOM.viewport, DOM.canvas);
const linkInput = new LinkController(DOM.linkInput, graph);
const theme = new ThemeController(DOM.themeButton);
const refresh = new RefreshButtonController(DOM.refreshButton, graph);
const settings = new SettingsController(DOM.settingsButton);

if (storage.link) {
    graph.render();
}
