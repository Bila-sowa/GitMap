import { getDefaultConfig, mergeConfigs } from "@/js/api/config";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * Verifies that `mergeConfigs` preserves valid configuration values while
 * replacing missing, malformed, or out-of-range values with defaults.
 *
 * #### Params:
 * - file: `config.js`
 * - test: `test_anl95_Data`
 * - name: `mergeConfigs`
 * - type: `function`
 *
 * @returns {Promise<TestFeedback>} Test feedback for partial and malformed configuration objects.
 */
export default function test_anl95_Data() {
    const defaultConfig = getDefaultConfig();
    const config = new TestConfig(
        {
            file: "config.js",
            test: "test_anl95_Data",
            name: "mergeConfigs",
            type: "function",
        },
        {
            partialConfig: {
                ...defaultConfig,
                name: "Custom GitMap",
                graph: { renderLimit: 50 },
            },
            malformedConfig: {
                ...defaultConfig,
                versionDetails: {
                    ...defaultConfig.versionDetails,
                    versionType: "beta",
                },
            },
            nonObjectConfig: defaultConfig,
        },
    );

    return config.run(() => ({
        partialConfig: mergeConfigs({
            name: "Custom GitMap",
            graph: { renderLimit: 50 },
        }),
        malformedConfig: mergeConfigs({
            name: "",
            debug: "true",
            versionDetails: {
                version: 3,
                versionType: "beta",
                versionIsStable: "false",
            },
            graph: { renderLimit: -1.5 },
            notifications: {
                showNotifications: "yes",
                COOLDOWN_MS: Number.POSITIVE_INFINITY,
            },
            gitHub: { REQUEST_TIMEOUT_MS: 0 },
            loader: {
                showLoader: 1,
                CLEANUP_TIMEOUT_MS: -1,
            },
        }),
        nonObjectConfig: mergeConfigs(null),
    }));
}
