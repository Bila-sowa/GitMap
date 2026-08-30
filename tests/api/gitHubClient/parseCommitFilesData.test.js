import { GitHubDataParser } from "@/js/api/gitHubClient/gitHubDataParser";
import { ANY_VALID, TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test parses raw data from the GitHub REST API about files into more convenient and understandable data, extracting only what is needed.
 *
 * #### Params:
 * - file: `gitHubDataParser`
 * - test: `test_rz8ou_Data`
 * - name: `parseRepoData`
 * - type: `method`
 *
 * @returns TestFeedback
 */
export default function test_rz8ou_Data() {
    const config = new TestConfig(
        {
            file: "gitHubDataParser.js",
            test: "test_rz8ou_Data",
            name: "parseCommitFilesData",
            type: "method",
        },
        {
            files: ANY_VALID,
            success: true,
            truncated: ANY_VALID,
        },
        {
            files: [
                {
                    sha: "955aac5edba26fa1d8f1ef0f235bbb4817fe9c63",
                    filename: "README.md",
                    status: "modified",
                    additions: 3,
                    deletions: 3,
                    changes: 6,
                    blob_url:
                        "https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/README.md",
                    raw_url:
                        "https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/README.md",
                    contents_url:
                        "https://api.github.com/repos/Bila-sowa/GitMap/contents/README.md?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6",
                    patch: '@@ -58,10 +58,10 @@ You can also add a <a href="https://github.com/settings/personal-access-tokens"\n </h2>\n \n <h3>Options for open</h3>\n+<span><b>Only by:</b></span>\n <ul>\n-    <li>By <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a></li>\n-    <li>By <a href="#" target="_blank">GitHub Pages</a></li>\n-    <li>By opening <code>index.html</code> directly in your browser</li>\n+    <li><a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a></li>\n+    <li><a href="#" target="_blank">GitHub Pages</a></li>\n </ul>\n \n <h3>Using</h3>',
                },
                {
                    sha: "4037b3acf0a2f93acda6ff985722a8ea9250bbb6",
                    filename: "src/css/style.css",
                    status: "modified",
                    additions: 92,
                    deletions: 0,
                    changes: 92,
                    blob_url:
                        "https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fcss%2Fstyle.css",
                    raw_url:
                        "https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fcss%2Fstyle.css",
                    contents_url:
                        "https://api.github.com/repos/Bila-sowa/GitMap/contents/src%2Fcss%2Fstyle.css?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6",
                    patch: "@@ -178,12 +178,22 @@ main {\n }\n \n .commit {\n+    position: relative;\n     width: 64px;\n     height: 64px;\n     border: 5px solid var(--accent-color-1);\n     border-radius: 999px;\n }\n \n+.commit::before {\n+    font-size: 1.2rem;\n+    content: attr(name);\n+    position: absolute;\n+    right: 120px;\n+    top: 12px;\n+    width: 250px;\n+}\n+\n .commit:hover, .commit:active { background: none; }\n \n .connection {\n@@ -197,3 +207,85 @@ main {\n     margin: -8px 0px;\n     border: 2px solid var(--accent-color-1);\n }\n+\n+.full-commit-modal {\n+    position: fixed;\n+    z-index: 20;\n+    top: 77px;\n+    right: 0;\n+    height: calc(100dvh - 77px);\n+    width: 30dvw;\n+    box-sizing: border-box;\n+    padding: 20px;\n+    background: var(--color-3);\n+    display: flex;\n+    flex-direction: column;\n+    gap: 20px;\n+    /* animation: modal-pop; */\n+}\n+\n+.full-commit-modal button {\n+    position: absolute;\n+    right: 0;\n+    top: 0;\n+    font-size: 2rem;\n+    margin: 2px;\n+    width: 50px;\n+    height: 50px;\n+    border-radius: 999px;\n+    transition: background 0.3s ease;\n+}\n+\n+.full-commit-modal h2 {\n+    font-size: 1.75rem; \n+}\n+\n+.full-commit-modal p {\n+    font-size: 1rem;\n+    font-weight: 600;\n+    color: var(--text-color-2);\n+}\n+\n+.full-commit-modal .data-container {\n+    margin-top: 40px;\n+    display: flex;\n+    flex-direction: column;\n+    gap: 20px;\n+}\n+\n+.full-commit-modal .changes-container {\n+    margin-top: auto;\n+    height: 300px;\n+    width: 100%;\n+    display: flex;\n+    flex-direction: column;\n+    align-items: center;\n+    justify-content: space-between;\n+}\n+\n+.full-commit-modal .changes-container h3 { \n+    width: 100%;\n+    padding-bottom: 5px;\n+    font-size: 1.35rem;\n+    border-bottom: var(--border-color-1) 2px solid;\n+}\n+\n+.full-commit-modal .changes-container div { overflow-y: scroll; }\n+\n+.full-commit-modal .changes-container a { \n+    background: var(--color-4);\n+    width: 260px;\n+    height: 50px;\n+    font-size: 1rem;\n+    display: flex;\n+    justify-content: center;\n+    align-items: center;\n+    gap: 10px;\n+    border-radius: 10px;\n+    transition: background 0.3s ease;\n+}\n+\n+\n+.full-commit-modal .changes-container a:hover { \n+    background: var(--hover-color-1);\n+}",
                },
                {
                    sha: "8c0765bab07924ce793d19c29dba51fbdd962751",
                    filename: "src/js/controllers/graph.js",
                    status: "modified",
                    additions: 30,
                    deletions: 10,
                    changes: 40,
                    blob_url:
                        "https://github.com/Bila-sowa/GitMap/blob/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fjs%2Fcontrollers%2Fgraph.js",
                    raw_url:
                        "https://github.com/Bila-sowa/GitMap/raw/46f5cd270ddda0267790caf4fe48ec8895149ec6/src%2Fjs%2Fcontrollers%2Fgraph.js",
                    contents_url:
                        "https://api.github.com/repos/Bila-sowa/GitMap/contents/src%2Fjs%2Fcontrollers%2Fgraph.js?ref=46f5cd270ddda0267790caf4fe48ec8895149ec6",
                    patch: '@@ -9,6 +9,7 @@ export default class Graph {\n     #isFullOpen = false;\n     #isHoverOpen = false;\n     #hoverTimeoutId = null;\n+    #lastFocusedCommit = null;\n \n     constructor(graphElement) {\n         this.#body = document.querySelector("body")\n@@ -27,7 +28,7 @@ export default class Graph {\n             const isLast = index === this.#data.commitsDetails.length - 1;\n \n             const commitCard = `\n-                <button class="commit" data-id="${index}" aria-label="Open commit: ${commit.title}" title="Open commit: ${commit.title}"></button>\n+                <button class="commit" data-id="${index}" name="${commit.title}" aria-expanded="false" aria-label="Open commit: ${commit.title}" title="Open commit: ${commit.title}"></button>\n                 ${isLast ? \'\' : `\n                 <div class="connection">\n                     <span></span>\n@@ -43,7 +44,7 @@ export default class Graph {\n     #bindEvents() {\n         this.#graph.addEventListener(\'click\', this.#openFullCommitModal);\n         this.#graph.addEventListener(\'mouseover\', this.#openHoverCommitModal);\n-        this.#graph.addEventListener(\'mouseout\', this.#closeCommitModal);\n+        this.#graph.addEventListener(\'mouseout\', this.#closeHoverCommitModal);\n     }\n \n     async #getData(link) {\n@@ -55,19 +56,24 @@ export default class Graph {\n         const commitButton = e.target.closest(\'.commit\');\n         const commit = this.#data?.commitsDetails[+commitButton?.dataset.id];\n \n-        if (!commit || this.#isFullOpen || this.#isHoverOpen) return;\n+        if (!commit) return;\n \n         if (this.#hoverTimeoutId) {\n             clearTimeout(this.#hoverTimeoutId);\n             this.#hoverTimeoutId = null;\n         }\n \n-        console.log(commit)\n+        document.querySelector("#hover-commit-modal")?.remove();\n+        this.#isHoverOpen = false;\n+\n+        document.querySelector("#full-modal-window")?.remove();\n+        this.#lastFocusedCommit?.setAttribute("aria-expanded", "false");\n \n         const card = `\n-            <div class="full-commit-modal">\n+            <div class="full-commit-modal" id="full-modal-window" role="dialog">\n+                <button id="close-button" aria-label="close">&times;</button>\n                 <h2>${commit.title}</h2>\n-                <p>${commit.description ? "Description" + commit.description : ""} </p>\n+                <p>${commit.description ? "Description: " + commit.description : ""} </p>\n                 <div class="data-container">\n                     <span title="Email: ${commit.author.email}">Author: ${commit.author.name}</span>\n                     <span>Hash: ${commit.hash}</span>\n@@ -78,13 +84,27 @@ export default class Graph {\n                     <div>\n \n                     </div>\n-                    <a href="${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b></a>\n+                    <a href="${commit.url}" target="_blank" rel="noopener noreferrer">View in <b>GitHub</b><img width="32" src="./images/github_logo.webp" alt></a>\n                 </div>\n             </div>\n         `;\n \n-        // this.#body.insertAdjacentHTML("beforeend", card);\n+        commitButton.setAttribute("aria-expanded", "true");\n+        this.#body.insertAdjacentHTML("beforeend", card);\n         this.#isFullOpen = true;\n+        this.#lastFocusedCommit = commitButton;\n+\n+        const modal = document.querySelector("#full-modal-window");\n+        const closeButton = document.querySelector("#close-button");\n+\n+        closeButton.focus();\n+\n+        closeButton.addEventListener("click", () => {\n+            modal.remove();\n+            this.#isFullOpen = false;\n+            commitButton.setAttribute("aria-expanded", "false");\n+            commitButton.focus();\n+        });\n     }\n \n     #openHoverCommitModal = (e) => {\n@@ -104,16 +124,16 @@ export default class Graph {\n             if (this.#isFullOpen) return;\n \n             this.#isHoverOpen = true;\n-            console.log(commit)\n         }, this.#delay);\n     }\n \n-    #closeCommitModal = () => {\n+    #closeHoverCommitModal = () => {\n         if (this.#hoverTimeoutId) {\n             clearTimeout(this.#hoverTimeoutId);\n             this.#hoverTimeoutId = null;\n         }\n \n+        document.querySelector("#hover-commit-modal")?.remove();\n         this.#isHoverOpen = false;\n     }\n }',
                },
            ],
        },
    );

    const parser = new GitHubDataParser();

    return config.run((testData) => {
        return parser.parseCommitFilesData(testData);
    });
}
