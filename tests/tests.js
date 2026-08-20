import * as gitHubClientTests from "./gitHubClient/index";
import * as utilsTests from "./utils/index";


const dataTests = [
    gitHubClientTests.test_3j3f8_Data,
    gitHubClientTests.test_hvnws_Data,
    gitHubClientTests.test_nd2u3_Data,
    gitHubClientTests.test_2rb1v_Data,
    utilsTests.test_0c2os_Data,
    utilsTests.test_gj781_Data,
];

const uiTests = [
    utilsTests.test_44ibx_Ui,
];

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
    const results = await Promise.all(shuffled.map(fn => fn()));

    const failed = results
        .map((result, i) => ({ name: shuffled[i].name, result }))
        .filter(({ result }) => !result.success);

    console.log(`Tests done: ${results.length - failed.length} passed, ${failed.length} failed.`);
    if (failed.length > 0) {
        console.error("Failed tests:", failed.map(({ name }) => name));
    }

    console.dir(results);
    return results;
}

async function runUiTests(tests = uiTests) {
    await Promise.all(shuffle(tests).map(fn => fn()));
    console.log(`Ui tests done`);
}

async function runTests() {
    const config = await loadTestConfig();

    if (config.dataTests) {
        await runDataTests();
    }

    if (config.uiTests) {
        await runUiTests();
    }
}

runTests();
