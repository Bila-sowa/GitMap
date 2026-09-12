---
name: push-app
description: Pushes the application for deployment to GitHub (not npm run build). Use when the user asks to push the application to GitHub, create a commit, or something similar.
---

# push-app

## When to use?

- When the user asks to push the application
- When the user asks to create a commit
- When the user asks to update the version

## Workflow

1. **Run linters and formatter**

    - Run the command `npm run check-all`, if there are errors — **notify** about them.
    - Run the command `npm run fix-all`, mandatory

2. **Change the application version**
    - Go through the files and check which group the update belongs to: major.minor.patch.
    - Make changes in `package.json`, `package-lock.json`, `public/config.json`

3. **Create a commit description**
    - Go through all the files and create a commit description strictly according to this pattern:

    ```
    Update GitHubClient

    Small Description(60-120 words).
    - added: checkRateLimit.js
    - changed: gitHubClient.js
    - deleted: test_2.mjs
    - moved: test_1.mjs
    - renamed: test_9.mjs to test_8.mjs
    ```

4. **Create and push the commit to the remote repository**
    - Be sure to use the previously created description
    - Add the corresponding tag to the commit and also push it. If the version in config.json is `2.2.2`, the tag should be: `v2.2.2`

5. **Report**
    - Add a status message at the end. Whether everything went smoothly or if any problems occurred.

## Rules

- Do not change the clearly specified formats (versions, commit description).
- Do not push the commit if the linters show errors (there are exceptions such as marked, etc.)
- Do not create branches yourself
