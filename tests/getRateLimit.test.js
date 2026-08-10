import getRateLimit from "../src/js/utils/getRateLimit.js";
import TestFeedBack from "./testFeedBack.js";

export default async function test_002() {
    const result = await getRateLimit();

    if (result.success) {
        return new TestFeedBack("getRateLimit.js", "getRateLimit", "function", true, result.data)
    } else {
        return new TestFeedBack("getRateLimit.js", "getRateLimit", "function", false, result.error)
    };
}
