import { escapeHTML } from "@/js/utils/utils";
import { TestConfig } from "../tools/testTools";

/**
 * #### Description:
 * 
 * The test checks protection against various XSL attack patterns.
 * 
 * #### Params:
 * - file: `utils.js`
 * - test: `test_0c2os_Data`
 * - name: `escapeHTML`
 * - type: `function`
 * 
 */
export default function test_0c2os_Data(appendToHTML = false) {
    const config = new TestConfig(
        {
            file: "utils.js",
            name: "escapeHTML",
            test: "test_0c2os_Data",
            type: "function",
        },
        {
            pattern1: "&lt;input style=&quot;display: none;&quot; type=&quot;text&quot; value=&quot;&quot; onfocus=&quot;alert(&#39;XSS&#39;)&quot; autofocus&gt;",
            pattern2: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
            pattern3: "&lt;textarea style=&quot;display: none;&quot;&gt;&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;&lt;/textarea&gt;",
        },
        {
            pattern1: `<input style="display: none;" type="text" value="" onfocus="alert('XSS')" autofocus>`,
            pattern2: `<script>alert("XSS")</script>`,
            pattern3: `<textarea style="display: none;"><img src=x onerror=alert('XSS')></textarea>`,
        },
    );

    return config.run(({ pattern1, pattern2, pattern3 }) => {
        const testData = {
            pattern1: escapeHTML(pattern1),
            pattern2: escapeHTML(pattern2),
            pattern3: escapeHTML(pattern3),
        };

        if (appendToHTML) {
            for (const pattern in testData) {
                document.body.insertAdjacentHTML("beforeend", testData[pattern]);
            }
        }

        return testData;
    });
}
