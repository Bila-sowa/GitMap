import test_001 from "./getGitHubData.test.js";
import test_002 from "./getRateLimit.test.js";

const tests = [
    test_001,
    test_002,
];

function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

async function runTests() {
    const results = await Promise.all(shuffle(tests).map(fn => fn()));

    const failed = results
        .map((result, i) => ({ name: tests[i].name, result }))
        .filter(({ result }) => !result.success);


    console.log(`Tests done: ${results.length - failed.length} passed, ${failed.length} failed.`);
    if (failed.length > 0) {
        console.error("Failed tests:", failed.map(({ name }) => name));
    };

    console.dir(results)
    return results;
}

runTests();
