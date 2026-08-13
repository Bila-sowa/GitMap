import { escapeHTML } from "@/js/utils/utils";
import TestFeedBack from "./testFeedBack";

export default function test_003_Data(appendToHTML = false) {
    try {
        const testData = {
            pattern1: escapeHTML(`<input style="display: none;" type="text" value="" onfocus="alert('XSS')" autofocus>`),
            pattern2: escapeHTML(`<script>alert("XSS")</script>`),
            pattern3: escapeHTML(`<textarea style="display: none;"><img src=x onerror=alert('XSS')></textarea>`),
        };

        if (appendToHTML) {
            for (const pattern in testData) {
                document.body.insertAdjacentHTML("beforeend", testData[pattern]);
            }
        }

        return new TestFeedBack("utils.js", "escapeHTML", "function", true, testData);
    } catch (err) {
        console.error(err);
        return new TestFeedBack("utils.js", "escapeHTML", "function", false, err)
    }
}
