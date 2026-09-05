import * as apiTests from "./api/index";
import * as utilsTests from "./utils/index";
import * as appDataTests from "./data/index";

const dataTests = [
    apiTests.test_nd2u3_Data,
    apiTests.test_hvnws_Data,
    apiTests.test_3j3f8_Data,
    apiTests.test_483nq_Data,
    apiTests.test_idi3p_Data,
    apiTests.test_rz8ou_Data,
    apiTests.test_05yau_Data,
    utilsTests.test_0c2os_Data,
    utilsTests.test_gj781_Data,
    appDataTests.test_8je0j_Data,
];

const uiTests = [utilsTests.test_44ibx_Ui];

async function sleap(ms = 500) {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        }, ms),
    );
}

async function loadTestConfig() {
    try {
        const response = await fetch(new URL("./config.json", import.meta.url));
        if (!response.ok) {
            throw new Error(`Failed to load config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn("Using default test config because config.json could not be loaded.", error);
        return {
            uiTests: false,
            dataTests: false,
        };
    }
}

function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

async function runDataTests(tests = dataTests) {
    const shuffled = shuffle(tests);
    const results = [];

    for (const fn of shuffled) {
        await sleap();
        const result = await fn();
        results.push(result);
    }

    const failed = results
        .map((result, i) => ({ name: shuffled[i].name, result }))
        .filter(({ result }) => !result || !result.success);

    console.log(`Tests done: ${results.length - failed.length} passed, ${failed.length} failed.`);
    if (failed.length > 0) {
        console.error(
            "Failed tests:",
            failed.map(({ name }) => name),
        );
    }

    console.table(results);
    return results;
}

async function runUiTests(tests = uiTests) {
    for (const fn of shuffle(tests)) {
        await sleap();
        await fn();
    }
    console.log(`Ui tests done`);
}

async function runTests() {
    const config = await loadTestConfig();

    console.group("Unit tests");
    const startTime = performance.now();

    if (config.dataTests) {
        await runDataTests();
    }

    if (config.uiTests) {
        await runUiTests();
    }

    const endTime = performance.now();
    console.log(`Test execution time: ${Math.round(endTime - startTime)} ms`);
    console.groupEnd();
}

runTests();
