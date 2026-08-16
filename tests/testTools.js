const findAndThrowError = (object) => {
    if (!object) return;

    for (const [key, value] of Object.entries(object)) {
        if (value && typeof value === "object" && value.success === false) {
            throw new Error(`${key}: ${value.error}`);
        };
    };
};

/**
 * Marker used inside an `expected` value to say "I don't care about the
 * exact value here — just make sure it's present and not undefined,
 * null, or NaN". Import and use it as a placeholder value for any key
 * where only presence/validity matters, not the exact value.
 */
const ANY_VALID = Symbol('ANY_VALID');

/**
 * Checks whether a value is "forbidden": undefined, null, or NaN.
 *
 * @param {*} value - value to check
 * @returns {boolean} true if the value is undefined, null, or NaN
 */
const isInvalidValue = (value) =>
    value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value));

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
    if (typeof expected !== 'object' || expected === null) {
        return Object.is(actual, expected);
    }

    // expected is an object/array, so actual must be one too
    if (typeof actual !== 'object' || actual === null) {
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

class TestFeedBack {
    constructor({ file, name, test, type, success, data }) {
        this.file = file;
        this.name = name;
        this.test = test;
        this.type = type;
        this.success = success;
        this.data = data;
    };
};

const validateTestData = (object, expected) => {
    if (object) findAndThrowError(object);
    if (object && expected) {
        const result = equalKeysAndValidValues(object, expected);
        return result;
    };
    return true;
};

export {
    findAndThrowError,
    ANY_VALID,
    equalKeysAndValidValues,
    TestFeedBack,
    validateTestData,
};
