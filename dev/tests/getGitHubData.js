class GitHubClient {
    constructor(url) {
        const { branchLink, commitsLink } = GitHubClient.formatGitHubUrl(url);
        this.branchLink = branchLink;
        this.commitsLink = commitsLink;
        this.headers = { 'Accept': 'application/vnd.github+json' };
    }

    static formatGitHubUrl(url) {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) throw new Error('Invalid GitHub URL');

        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, '').replace(/\/$/, '');

        return {
            branchLink: `https://api.github.com/repos/${owner}/${cleanRepo}/branches`,
            commitsLink: `https://api.github.com/repos/${owner}/${cleanRepo}/commits`,
        };
    };

    async getRawData() {
        try {
            const branchesRes = await fetch(this.branchLink, { headers: this.headers });
            const commitsRes = await fetch(this.commitsLink, { headers: this.headers });

            if (!branchesRes.ok || !commitsRes.ok) {
                if (branchesRes.status === 403 || commits.status === 403) {
                    // showMessage("")
                    throw new Error(`Hourly request limit reached. Status: ${branchesRes.status} / ${commitsRes.status}`);
                } else {
                    throw new Error(`GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
                };
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return { branches, commits, success: true };

        } catch(err) {
            // showError(err.message);
            console.error(err.message);
            return { error: err.message, success: false};
        }
    };

    async getData () {
        const data = await this.getRawData();
        if (!data.success) return;

        const { branches, commits } = data;
        let commitsDetails = [];
        let branchesDetails = [];

        commits.forEach(commit => {
            const details = {
                author: commit.commit.author,
                message: commit.commit.message,
                url: commit.commit.url,
            };
            
            commitsDetails.push(details);
        });

        branches.forEach(branch => {
            const details = { name: branch.name };

            branchesDetails.push(details);
        })

        return {
            commitsDetails: commitsDetails,
            branchesDetails: branchesDetails,
        };
    };

    setToken(token) {
        if (token) {
            this.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.headers.Authorization;
        }
    }
};

const client = new GitHubClient("https://github.com/Bila-sowa/Web-player-");

console.log(await client.getData());