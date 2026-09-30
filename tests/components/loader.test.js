import { generateLoader, removeLoader } from "@/js/components/Loader";
import { TestConfig } from "../tools/testTools";

/**
 * #### Description:
 *
 * Verifies that each loader operation owns its cleanup and that a loader is
 * removed automatically when its configured safety timeout expires.
 *
 * #### Params:
 * - file: `Loader/index.js`
 * - test: `test_vyk8w_Data`
 * - name: `generateLoader/removeLoader`
 * - type: `function`
 *
 * @returns {Promise<TestFeedback>} Test feedback for loader ownership and timeout cleanup.
 */
export default function test_vyk8w_Data() {
    const config = new TestConfig(
        {
            file: "Loader/index.js",
            test: "test_vyk8w_Data",
            name: "generateLoader/removeLoader",
            type: "function",
        },
        {
            replacedOldLoader: true,
            oldCleanupPreservesNewLoader: true,
            manualCleanup: true,
            configuredTimeoutPersists: true,
            timeoutCleanup: true,
        },
    );

    return config.run(async () => {
        const firstLoader = generateLoader(1000);
        const secondLoader = generateLoader(1000);
        const replacedOldLoader = !firstLoader.isConnected && secondLoader.isConnected;

        removeLoader(firstLoader);
        const oldCleanupPreservesNewLoader = secondLoader.isConnected;

        removeLoader(secondLoader);
        const manualCleanup = !secondLoader.isConnected;

        const configuredTimeoutLoader = generateLoader();
        await new Promise((resolve) => setTimeout(resolve, 20));
        const configuredTimeoutPersists = configuredTimeoutLoader.isConnected;
        removeLoader(configuredTimeoutLoader);

        const timeoutLoader = generateLoader(10);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const timeoutCleanup = !timeoutLoader.isConnected;

        return {
            replacedOldLoader,
            oldCleanupPreservesNewLoader,
            manualCleanup,
            configuredTimeoutPersists,
            timeoutCleanup,
        };
    });
}
