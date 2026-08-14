<div align="center">
    <img width="600" src="./public/banner.webp" alt="banner">
</div>

# About project

**GitMap** - a simple website to load your graph from a repo with a drag & drop canvas, letting you explore branches and commit history visually.
You can also add a [personal access token](https://github.com/settings/personal-access-tokens) to increase the [GitHub REST API limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2026-03-10&versionId=free-pro-team%40latest&productId=rest). Don't worry, the personal token is stored only in LocalStorage and only with your consent in the settings.

## Demo

<div>
    <h3>Drag & Drop Canvas</h3>
    <img src="" alt=""><br>
    <h3>Graph</h3>
    <img src="" alt=""><br>
    <h3>Settings</h3>
    <img src="" alt=""><br>
</div>


## Features

- Drag & drop interactive canvas for browsing commit graphs
- View commits across all branches
- Inspect commit details: description, author, author's email (on hover), date, changes, and hash
- Switch between branches directly from the UI
- Refresh the graph to fetch up-to-date data
- Light/dark theme toggle
- Optional personal access token support to raise GitHub REST API rate limits
- Live view of your remaining GitHub REST API limit

## Stack 
- <img width="16px" src="./public/icons/html.svg" alt> HTML 5
- <img width="16px" src="./public/icons/sass.svg"> Sass
- <img width="16px" src="./public/icons/js.svg"> JavaScript

## Requirements
- A modern browser with JavaScript enabled
- Without a personal access token, GitHub REST API requests are limited to 60 requests/hour per IP
- With a personal access token, the limit increases to 5,000 requests/hour


## How to use

### Local usage
Before using it locally, you must have [Node.js](https://nodejs.org/en) and npm or another package manager.

1. Clone this repo or download it.
```sh
git clone https://github.com/Bila-sowa/GitMap.git;
```
2. Open the project in your IDE.
3. Install dependencies
```sh
npm install
```
4. Run the live server
```sh
npm run dev
```
- For build and deploy
```sh
npm run build # building the app in the Dist folder
npm run preview # open the built app
npm run deploy # deploy on the gh-pages (create a new branch gh-pages)
```

### Public usage
Open the (future link)

1. Paste a link to a GitHub repository into the input field
2. Click a commit node to view its details, or hover over the author to see their email
3. Open the settings panel to switch branches, change the theme, refresh the graph, add a personal access token, or check your remaining API limit


## Contributing
Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch for your feature or fix
3. Commit your changes
4. Open a pull request describing what you changed and why


## License
This project is licensed under the <a href="" target="_blank">MIT License</a>.

## Links
Other links on the topic of this project:

- [GitHub REST API Docs](https://docs.github.com/en/rest?apiVersion=2026-03-10)
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)
