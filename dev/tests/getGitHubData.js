async function getGitHubData(url) {
    const formattedUrl = `${url}`

    const headers = {
        'Accept': 'application/vnd.github+json',
    };

    const branchesRes = await fetch(
        "https://api.github.com/repos/Bila-sowa/GitMap/branches",
        { headers }
    );

    const commitsRes = await fetch(
        "https://api.github.com/repos/Bila-sowa/GitMap/commits",
        { headers }
    );

    const branches = await branchesRes.json();
    const commits = await commitsRes.json();
    return { branches, commits };
}

