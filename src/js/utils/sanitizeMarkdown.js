import DOMPurify from "dompurify";
import { marked } from "marked";

const sanitizerConfig = {
    ALLOWED_TAGS: [
        "a",
        "blockquote",
        "br",
        "code",
        "del",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "li",
        "ol",
        "p",
        "pre",
        "strong",
        "table",
        "tbody",
        "td",
        "th",
        "thead",
        "tr",
        "ul",
    ],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
};

const sanitizeMarkdown = (markdown) => {
    if (!markdown) return "";

    const parsedMarkdown = marked.parse(String(markdown));
    return DOMPurify.sanitize(parsedMarkdown, sanitizerConfig);
};

export { sanitizeMarkdown };
