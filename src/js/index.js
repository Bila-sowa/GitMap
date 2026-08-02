import * as DOM from "./controllers/dom.js";
import { renderGraph } from './controllers/render.js';

import { CanvasController } from './controllers/canvas.js';

const canvasController = new CanvasController(DOM.viewport, DOM.canvas);
