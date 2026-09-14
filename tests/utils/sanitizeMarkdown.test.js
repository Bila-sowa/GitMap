import { sanitizeMarkdown } from "@/js/utils/sanitizeMarkdown";
import { TestConfig } from "../tools/testTools";

const parseHTML = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
};

export default function test_d4x9p_Data() {
    const config = new TestConfig(
        {
            file: "sanitizeMarkdown.js",
            test: "test_d4x9p_Data",
            name: "sanitizeMarkdown",
            type: "function",
        },
        {
            dangerousHrefRemoved: true,
            eventHandlerRemoved: true,
            imageRemoved: true,
            markdownPreserved: true,
            safeHrefPreserved: true,
        },
    );

    return config.run(() => {
        const dangerousLink = parseHTML(sanitizeMarkdown("[audit link](javascript:alert%281%29)"));
        const dangerousHTML = parseHTML(sanitizeMarkdown('<img src="x" onerror="alert(1)">'));
        const safeMarkdown = parseHTML(sanitizeMarkdown("**Safe** [link](https://example.com/audit)"));

        return {
            dangerousHrefRemoved: !dangerousLink.querySelector("a")?.hasAttribute("href"),
            eventHandlerRemoved: !dangerousHTML.querySelector("[onerror]"),
            imageRemoved: !dangerousHTML.querySelector("img"),
            markdownPreserved: safeMarkdown.querySelector("strong")?.textContent === "Safe",
            safeHrefPreserved:
                safeMarkdown.querySelector("a")?.getAttribute("href") === "https://example.com/audit",
        };
    });
}
