<div align="center">
  <img width="600" src="./public/banner.png" alt="GitMap banner">
  <h1 align="center">GitMap</h1>
  <p><strong>GitMap is a browser application for exploring a GitHub repository's commit history.</strong></p>
  <p align="center">
    <a href="#features">Features</a> &middot;
    <a href="#quick-start">Quick start</a> &middot;
    <a href="#how-to-use">How to use</a> &middot;
    <a href="#development-commands">Development</a> &middot;
    <a href="#contributing">Contributing</a> &middot;
    <a href="#license">License</a>
  </p>
</div>

## Features

- Pan and zoom the commit graph with mouse or touch controls.
- Browse the default branch or switch to another branch using the branch selector.
- Hover over or focus a commit for a summary; click it to inspect its description, author, date, hash, and changed files.
- Refresh the selected branch and switch between light and dark themes.
- Configure an optional GitHub personal access token and view API usage in Settings.
- Choose whether to remember the repository URL and token between visits.

## Requirements

- To use the application: a modern browser with JavaScript enabled and network access to GitHub's API.
- To develop locally: Git, npm, and a compatible [Node.js](https://nodejs.org/en) version. The dependencies in the current [lockfile](./package-lock.json) support Node.js 22 from `22.22.2`, Node.js 24 from `24.15.0`, or Node.js 26 and later. Node.js 20 does not satisfy the full development toolchain.

## Quick start

Run these commands from a terminal:

```sh
git clone https://github.com/Bila-sowa/GitMap.git # or ssh: git@github.com:Bila-sowa/GitMap.git
cd GitMap
npm ci
npm run dev
```

Open the local URL printed by Vite. The project uses the `/GitMap/` base path, so keep that path in the URL. `npm ci` installs the dependencies recorded in the lockfile.

## How to use

1. Paste a repository URL, such as `https://github.com/Bila-sowa/GitMap`, into the input and press Enter. HTTPS repository URLs and SSH-style URLs such as `git@github.com:Bila-sowa/GitMap.git` are accepted; both load data through the GitHub REST API.
2. Browse the default branch, or choose another branch from the branch selector below the graph.
3. Drag the canvas to pan. Use the `+` and `-` buttons, mouse wheel, or touch gestures to zoom.
4. Hover over or focus a commit for a summary. Click it for details and changed files; hover over the author in the details to see their email when available.
5. Use the header buttons to refresh the graph, change the theme, or open Settings.
6. In Settings, configure a token, choose whether to save the repository URL or token, and check API usage and token status.

### History limits

The graph displays commits for one selected branch at a time. It is not a complete view of every branch or the repository's entire history: commit loading currently uses a single API page, and the renderer applies `graph.renderLimit` from [public/config.json](./public/config.json), currently `30`. Increasing the rendering limit alone does not fetch older commits. The graph indicates how many of the loaded commits are shown.

### Tokens and API limits

Public repositories can be browsed without a token. GitHub's primary REST API limit is 60 unauthenticated requests per hour per IP address; requests authenticated with a personal access token count toward the user's 5,000-request hourly limit. Secondary limits can also apply. See [GitHub's rate-limit documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) for details.

A configured token is sent to GitHub's API to validate it and authenticate requests. It is kept in application memory and is written to the browser's `localStorage` only when **Save current token in page** is enabled in Settings; saving is disabled by default. Disabling that option removes the saved token on the next settings save. It does not encrypt the token or revoke it on GitHub. See [GitHub's token management guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for creating and revoking tokens.

If a request fails, check the repository URL, token status, and API usage. A token does not bypass rate limits or grant access to repositories beyond its permissions.

## Development commands

Run commands from the repository root after installing dependencies.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Serve the existing production build locally for inspection. |
| `npm test` or `npm run test:local` | Run the same offline Vitest `local` project. |
| `npm run test:e2e` | Run the explicitly selected Vitest `e2e` project. |
| `npm run check:all` | Run ESLint and Stylelint checks. |
| `npm run ES:check` / `npm run style:check` | Run either lint check separately. |
| `npm run fix:all` | Run ESLint and Stylelint fixes, then format `src/` with Prettier; this edits files. |
| `npm run ES:fix` / `npm run style:fix` | Apply either linter's fixes separately; these edit files. |
| `npm run prettier` | Format `src/` with Prettier; this edits files. Markdown is excluded. |
| `npm run compile` | Compile `src/styles.scss` to `src/styles.css` directly with Sass. |
| `npm run deploy` | Publish the existing `dist/` directory to the `gh-pages` branch. |

### Build, preview, and deployment

Build first, then inspect the output locally:

```sh
npm run build
npm run preview
```

Open the preview URL printed in the terminal with the `/GitMap/` base path. Preview is a local verification server.

For maintainers publishing to GitHub Pages, run `npm run deploy` only after producing and checking the intended build. It publishes `dist/` using `gh-pages`; it does not build the application first. Publishing requires Git access to the destination repository and the appropriate GitHub Pages configuration. A source commit or push by itself does not run this deployment command.

## Contributing

1. Read [RULES.md](./RULES.md) for project conventions, approval requirements, and verification rules.
2. Fork the repository and create a branch for your feature or fix.
3. Keep changes focused and run the checks appropriate to the change. Code changes require lint checks, local tests, and a production build; documentation-only changes require text, link, and whitespace checks.
4. Commit the changes and open a pull request explaining the problem, resulting behavior, and verification results.

## License

GitMap is licensed under the [MIT License](./LICENSE).
