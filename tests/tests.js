import config from "../src/js/data/config.js";
import test_001_Data from "./getGitHubData.test.js";
import test_003_Data from "./escapeHTML.test.js";
import test_001_Ui from "./createNotification.test.js";


const dataTests = [
    test_001_Data,
    test_003_Data,
];

const uiTests = [
    test_001_Ui,
];

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

if (config.dev) {
    runDataTests().then(() => runUiTests());
}
