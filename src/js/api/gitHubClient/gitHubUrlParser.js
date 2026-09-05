function parseGitHubUrl(url) {
    try {
        let owner;
        let repo;

        const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
        const httpsMatch = url.match(
            /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i,
        );

        if (sshMatch) {
            [, owner, repo] = sshMatch;
        } else if (httpsMatch) {
            [, owner, repo] = httpsMatch;
        } else {
            return {
                success: false,
                error: "Invalid GitHub URL",
                devError: `Failed to parse GitHub URL: "${url}". Expected HTTPS or SSH format.`,
            };
        }

        return {
            success: true,
            owner,
            repo,
            branchLink: `https://api.github.com/repos/${owner}/${repo}/branches`,
            commitsLink: `https://api.github.com/repos/${owner}/${repo}/commits`,
        };
    } catch (err) {
        return {
            success: false,
            error: "Invalid GitHub URL",
            devError: `URL parsing exception: ${err.message}`,
        };
    }
}

export default parseGitHubUrl;
