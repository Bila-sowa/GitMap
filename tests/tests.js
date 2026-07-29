import test_001 from "./getGitHubData.test.js";

const tests = [
    test_001,
];

async function runTests() {
    const results = await Promise.all(tests.map(fn => fn()));

    const failed = results
        .map((result, i) => ({ name: tests[i].name, result }))
        .filter(({ result }) => !result.success);

    
    console.log(`Tests done: ${results.length - failed.length} passed, ${failed.length} failed.`);
    if (failed.length > 0) {
        console.error("Failed tests:", failed.map(({ name }) => name));
    } else { console.dir(results); };
    return results;
}

runTests();
