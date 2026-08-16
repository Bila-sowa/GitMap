import { escapeHTML } from "@/js/utils/utils";
import * as tools from "../tools/testTools.js";

export default function test_0c2os_Data(appendToHTML = false) {
    const config = new tools.TestConfig(
        {
            file: "utils.js",
            name: "escapeHTML",
            test: "test_0c2os_Data",
            type: "function",
        },

        {
            "pattern1": "&lt;input style=&quot;display: none;&quot; type=&quot;text&quot; value=&quot;&quot; onfocus=&quot;alert(&#39;XSS&#39;)&quot; autofocus&gt;",
            "pattern2": "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
            "pattern3": "&lt;textarea style=&quot;display: none;&quot;&gt;&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;&lt;/textarea&gt;"
        },

    );
    let testData = {};
    try {
        testData = {
            pattern1: escapeHTML(`<input style="display: none;" type="text" value="" onfocus="alert('XSS')" autofocus>`),
            pattern2: escapeHTML(`<script>alert("XSS")</script>`),
            pattern3: escapeHTML(`<textarea style="display: none;"><img src=x onerror=alert('XSS')></textarea>`),
        };

        if (appendToHTML) {
            for (const pattern in testData) {
                document.body.insertAdjacentHTML("beforeend", testData[pattern]);
            };
        };

        const result = tools.equalKeysAndValidValues(testData, config.expected);

        return new tools.TestFeedBack({
            ...config.details,
            success: result,
            data: testData,
        });
    } catch (err) {
        console.error(err);
        return new tools.TestFeedBack({
            ...config.details,
            success: false,
            data: testData,
        })
    }
}
