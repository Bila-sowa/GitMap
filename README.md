<div style="width: 100%;">
    <img style="width: 50%; display: block; margin: 0 auto;" src="./readme/banner.webp" alt="banner">
</div>

<h1>
    About project
</h1>
<span><b>GitMap</b> - a simple website to load your graph from a repo with a drag & drop canvas, letting you explore branches and commit history visually.
You can also add a <a href="https://github.com/settings/personal-access-tokens" target="_blank">personal access token</a> to increase the <a href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2026-03-10&versionId=free-pro-team%40latest&productId=rest" target="_blank">GitHub REST API limit</a>. Don't worry, the personal token is stored only in LocalStorage and only with your consent in the settings.
</span>

<h2>
    Demo
</h2>
<div style="width: 100%;">
    <h3>Drag & Drop Canvas</h3>
    <img style="width: 100%; display: block; margin: 0 auto;" src="" alt="">
    <h3>Graph</h3>
    <img style="width: 100%; display: block; margin: 0 auto;" src="" alt="">
    <h3>Settings</h3>
    <img style="width: 100%; display: block; margin: 0 auto;" src="" alt="">
</div>

<h2>
    Features
</h2>
<ul>
    <li>Drag & drop interactive canvas for browsing commit graphs</li>
    <li>View commits across all branches</li>
    <li>Inspect commit details: description, author, author's email (on hover), date, changes, and hash</li>
    <li>Switch between branches directly from the UI</li>
    <li>Refresh the graph to fetch up-to-date data</li>
    <li>Light/dark theme toggle</li>
    <li>Optional personal access token support to raise GitHub REST API rate limits</li>
    <li>Live view of your remaining GitHub REST API limit</li>
</ul>

<h2>
    Stack
</h2>
<ul style="list-style: none; margin: 0; padding: 0;">
    <li><img style="list-style: none;" src="https://img.shields.io/badge/-HTML-090909?style=for-the-badge&logo=HTML5&logoColor=%3F" alt="HTML5"></li>
    <li><img style="list-style: none;" src="https://img.shields.io/badge/-CSS-090909?style=for-the-badge&logo=CSS&logoColor=204be4" alt="CSS3"></li>
    <li><img style="list-style: none;" src="https://img.shields.io/badge/-JavaScript-090909?style=for-the-badge&logo=JavaScript&logoColor=%3F" alt="JavaScript"></li>
</ul>

<h2>
    Requirements
</h2>
<ul>
    <li>A modern browser with JavaScript enabled</li>
    <li>Without a personal access token, GitHub REST API requests are limited to 60 requests/hour per IP</li>
    <li>With a personal access token, the limit increases to 5,000 requests/hour</li>
</ul>

<h2>
    How to use
</h2>

<h3>Options for open</h3>
<ul>
    <li>By <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank">Live Server</a></li>
    <li>By <a href="#" target="_blank">GitHub Pages</a></li>
    <li>By opening <code>index.html</code> directly in your browser</li>
</ul>

<h3>Using</h3>
<ol>
    <li>Paste a link to a GitHub repository into the input field</li>
    <li>Click a commit node to view its details, or hover over the author to see their email</li>
    <li>Open the settings panel to switch branches, change the theme, refresh the graph, add a personal access token, or check your remaining API limit</li>
</ol>

<h2>
    Contributing
</h2>
<span>Contributions are welcome! To contribute:</span>
<ol>
    <li>Fork the repository</li>
    <li>Create a new branch for your feature or fix</li>
    <li>Commit your changes</li>
    <li>Open a pull request describing what you changed and why</li>
</ol>

<h2>
    License
</h2>
<span>This project is licensed under the <a href="./LICENSE" target="_blank">MIT License</a>.</span>

<h2>
    Links
</h2>
<ul>
    <li><a href="https://docs.github.com/en/rest?apiVersion=2026-03-10">GitHub REST API Docs</a></li>
    <li><a href="https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph">Git Graph</a></li>
</ul>
