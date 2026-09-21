import { TestConfig, validateTestData } from "../testTools";

/**
 * #### Description:
 *
 * Verifies that `validateTestData` compares falsy actual and expected values
 * instead of treating them as an automatic success. It also confirms that
 * omitting `expected` remains supported.
 *
 * #### Params:
 * - file: `testTools.js`
 * - test: `test_p8lz0_Data`
 * - name: `validateTestData`
 * - type: `function`
 *
 * @returns {Promise<TestFeedback>} Test feedback containing the result of each falsy-value check.
 */
export default function test_p8lz0_Data() {
    const config = new TestConfig(
        {
            file: "testTools.js",
            test: "test_p8lz0_Data",
            name: "validateTestData",
            type: "function",
        },
        {
            rejectsUndefinedMismatch: true,
            rejectsNullMismatch: true,
            rejectsFalseMismatch: true,
            rejectsZeroMismatch: true,
            rejectsEmptyStringMismatch: true,
            acceptsExpectedFalse: true,
            acceptsExpectedZero: true,
            acceptsExpectedNull: true,
            acceptsMissingExpected: true,
        },
    );

    return config.run(() => ({
        rejectsUndefinedMismatch: !validateTestData(undefined, { success: true }),
        rejectsNullMismatch: !validateTestData(null, { success: true }),
        rejectsFalseMismatch: !validateTestData(false, { success: true }),
        rejectsZeroMismatch: !validateTestData(0, { success: true }),
        rejectsEmptyStringMismatch: !validateTestData("", { success: true }),
        acceptsExpectedFalse: validateTestData(false, false),
        acceptsExpectedZero: validateTestData(0, 0),
        acceptsExpectedNull: validateTestData(null, null),
        acceptsMissingExpected: validateTestData(undefined),
    }));
}
