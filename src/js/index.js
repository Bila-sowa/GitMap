import { CanvasController } from './controllers/canvas.js';

const viewport = document.querySelector('.viewport');
const canvas = document.querySelector('.canvas');

const canvasController = new CanvasController(viewport, canvas);
