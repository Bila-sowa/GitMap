import { loadConfig } from "./api/config.js";
import storage from "./data/storage.js";
import notifications from "./utils/notificationManager.js";
import { getDomElements } from "./controllers/dom.js";
import { LocalStorageController } from "./controllers/localStorage.js";
import { CanvasController } from "./controllers/canvas.js";
import { ScaleController } from "./controllers/scale.js";
import { GraphController } from "./controllers/graph.js";
import { LinkController } from "./controllers/link.js";
import { RefreshButtonController } from "./controllers/refresh.js";
import { SettingsController } from "./controllers/settings.js";
import { ThemeController } from "./controllers/theme.js";
import { DropDown } from "./controllers/dropDown.js";

let application = null;
let bootstrapPromise = null;

async function bootstrap() {
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
        await loadConfig();
        const dom = getDomElements();
        const localStorage = new LocalStorageController(storage, notifications);
        localStorage.init();

        const { default: gitHubClient } = await import("./api/gitHubClient");
        const tokenResult = storage.token ? await gitHubClient.setToken(storage.token) : { success: true };
        const canvas = new CanvasController(dom.viewport, dom.canvas);
        const scale = new ScaleController(dom.scaleIncreaseButton, dom.scaleDisplay, dom.scaleDecreaseButton, canvas);
        const dropDown = new DropDown(dom.dropDownTrigger, dom.dropDownList, dom.dropDownLabel);
        const graph = new GraphController(dom.graph, dom.body, storage, gitHubClient, dropDown);
        const linkInput = new LinkController(dom.linkInput, graph, storage, localStorage);
        const refresh = new RefreshButtonController(dom.refreshButton, graph);
        const settings = new SettingsController(dom.settingsButton, gitHubClient, storage, localStorage);
        const theme = new ThemeController(dom.themeButton, dom.body, storage, localStorage);
        const controllers = [canvas, scale, dropDown, graph, linkInput, refresh, settings, theme];
        const initialized = [];

        dropDown.setOnSelect((branch) => graph.renderByBranch(branch));
        try {
            controllers.forEach((controller) => {
                initialized.push(controller);
                controller.init();
            });
        } catch (error) {
            dropDown.setOnSelect(null);
            [...initialized].reverse().forEach((controller) => controller.destroy());
            throw error;
        }

        const app = {
            destroy() {
                if (application !== app) return;
                dropDown.setOnSelect(null);
                [...controllers].reverse().forEach((controller) => controller.destroy());
                localStorage.destroy();
                application = null;
                bootstrapPromise = null;
            },
        };
        application = app;

        if (storage.link && tokenResult.success) graph.render();

        return application;
    })().catch((error) => {
        bootstrapPromise = null;
        throw error;
    });

    return bootstrapPromise;
}

export { bootstrap };
