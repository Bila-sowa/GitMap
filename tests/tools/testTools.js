/**
 * Walks `object` looking for a "failed" result (`success === false`) at the
 * top level or one level of nesting, and throws if a failure is found that
 * isn't the *expected* outcome for that same spot in `expected`.
 *
 * This acts as an early "fail fast" guard for *unexpected* failures (e.g. a
 * method that was supposed to succeed but blew up). It intentionally skips
 * throwing when `expected` says that particular field is supposed to have
 * `success: false`, so that legitimate "this should fail" test cases can
 * proceed to the normal `equalKeysAndValidValues` comparison instead of
 * being short-circuited here.
 *
 * @param {*} object - the actual value returned by the tested method; checked
 *   for a `success === false` shape at the top level and one level deep.
 * @param {*} [expected] - the expected shape for `object`, used only to check
 *   whether a `success: false` at a given key is the *expected* result
 *   (in which case no error is thrown for that key). If omitted, any
 *   `success: false` found is treated as unexpected and throws.
 * @throws {Error} if `object.success === false` (or a nested field's
 *   `success === false`) and the corresponding spot in `expected` does not
 *   also expect `success: false`.
 * @returns {void}
 */
const findAndThrowError = (object, expected) => {
    if (!object || typeof object !== "object") return;

    const topLevelExpectsFailure = expected && typeof expected === "object" && expected.success === false;

    if (object.success === false && !topLevelExpectsFailure) {
        throw new Error(object.error ? object.error.message || object.error : "Request failed");
    }

    for (const [key, value] of Object.entries(object)) {
        if (value && typeof value === "object") {
            const nestedExpected = expected && typeof expected === "object" ? expected[key] : undefined;
            const nestedExpectsFailure =
                nestedExpected && typeof nestedExpected === "object" && nestedExpected.success === false;

            if (value.success === false && !nestedExpectsFailure) {
                throw new Error(`${key}: ${value.error ? value.error.message || value.error : "Request failed"}`);
            }
        }
    }
};
/**
 * Marker used inside an `expected` value to say "I don't care about the
 * exact value here — just make sure it's present and not undefined,
 * null, or NaN". Import and use it as a placeholder value for any key
 * where only presence/validity matters, not the exact value.
 */
const ANY_VALID = Symbol("ANY_VALID");

/**
 * Checks whether a value is "forbidden": undefined, null, or NaN.
 *
 * @param {*} value - value to check
 * @returns {boolean} true if the value is undefined, null, or NaN
 */
const isInvalidValue = (value) =>
    value === undefined || value === null || (typeof value === "number" && Number.isNaN(value));

/**
 * Compares `actual` against `expected`. For every key in `expected`:
 * - if the expected value is the `ANY_VALID` marker, only checks that the
 *   matching value in `actual` is not undefined, null, or NaN;
 * - otherwise requires an exact match with the value in `actual`.
 * Objects/arrays must share the exact same key set; nested objects and
 * arrays are checked the same way, recursively.
 *
 * @param {*} actual - the value being checked
 * @param {*} expected - the expected value/shape (may contain ANY_VALID)
 * @param {WeakMap} [seen] - internal parameter used to guard against cycles
 * @returns {boolean} true if actual matches expected under the rules above
 */
const equalKeysAndValidValues = (actual, expected, seen = new WeakMap()) => {
    // The wildcard marker only requires a valid (non-forbidden) value, regardless of type
    if (expected === ANY_VALID) {
        return !isInvalidValue(actual);
    }

    // expected is a primitive (or null): require an exact match
    if (typeof expected !== "object" || expected === null) {
        return Object.is(actual, expected);
    }

    // expected is an object/array, so actual must be one too
    if (typeof actual !== "object" || actual === null) {
        return false;
    }

    // Guard against circular references (expected -> actual -> expected ...)
    if (seen.get(expected) === actual) {
        return true;
    }
    seen.set(expected, actual);

    // Objects/arrays (including nested and "hybrid" structures) must share the exact same key set
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    if (expectedKeys.length !== actualKeys.length) {
        return false;
    }

    return expectedKeys.every((key) => {
        if (!Object.prototype.hasOwnProperty.call(actual, key)) {
            return false;
        }

        return equalKeysAndValidValues(actual[key], expected[key], seen);
    });
};

class TestFeedback {
    constructor({ file, name, test, type, success, data }) {
        this.file = file;
        this.name = name;
        this.test = test;
        this.type = type;
        this.success = success;
        this.data = data;
    }
}

class TestConfig {
    constructor(details, expected, testData = {}) {
        this.details = details;
        this.expected = expected;
        this.testData = testData;
    }

    async run(testCallback) {
        let data = {};
        try {
            data = await testCallback(this.testData, this);
            const success = validateTestData(data, this.expected);

            return new TestFeedback({
                ...this.details,
                success,
                data,
            });
        } catch (err) {
            console.error(err);
            return new TestFeedback({
                ...this.details,
                success: false,
                data,
            });
        }
    }
}

const validateTestData = (object, expected) => {
    if (!object) return true;

    findAndThrowError(object, expected);

    if (!expected) return true;

    return equalKeysAndValidValues(object, expected);
};

export { findAndThrowError, ANY_VALID, equalKeysAndValidValues, TestFeedback, TestConfig, validateTestData };
