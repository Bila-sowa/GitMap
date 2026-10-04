import { LinkController } from "@/js/controllers/link";
import { RefreshButtonController } from "@/js/controllers/refresh";
import { TestConfig } from "../tools/testTools";

export default function test_c7p2m_Data() {
    const config = new TestConfig(
        {
            file: "bootstrap.js",
            test: "test_c7p2m_Data",
            name: "Controller lifecycle",
            type: "function",
        },
        {
            noListenersBeforeInit: true,
            dependenciesApplied: true,
            listenersRemovedOnDestroy: true,
            canReinitialize: true,
        },
    );

    return config.run(() => {
        const input = new EventTarget();
        const button = new EventTarget();
        input.value = " https://github.com/example/repo ";
        const storage = { link: "", saveLink: true };
        let renders = 0;
        let refreshes = 0;
        let saves = 0;
        const graph = {
            render: () => renders++,
            refresh: () => refreshes++,
        };
        const localStorage = { save: () => saves++ };
        const link = new LinkController(input, graph, storage, localStorage);
        const refresh = new RefreshButtonController(button, graph);
        const enter = new Event("keydown");
        Object.defineProperty(enter, "code", { value: "Enter" });

        input.dispatchEvent(enter);
        button.dispatchEvent(new Event("click"));
        const noListenersBeforeInit = renders === 0 && refreshes === 0;

        link.init();
        refresh.init();
        input.value = " https://github.com/example/repo ";
        input.dispatchEvent(enter);
        button.dispatchEvent(new Event("click"));
        const dependenciesApplied =
            storage.link === "https://github.com/example/repo" && renders === 1 && refreshes === 1 && saves === 1;

        link.destroy();
        refresh.destroy();
        input.dispatchEvent(enter);
        button.dispatchEvent(new Event("click"));
        const listenersRemovedOnDestroy = renders === 1 && refreshes === 1;

        link.init();
        refresh.init();
        input.dispatchEvent(enter);
        button.dispatchEvent(new Event("click"));
        const canReinitialize = renders === 2 && refreshes === 2;
        link.destroy();
        refresh.destroy();

        return { noListenersBeforeInit, dependenciesApplied, listenersRemovedOnDestroy, canReinitialize };
    });
}
