class GitHubClient {
    constructor(url) {
        const { branchLink, commitsLink } = GitHubClient.formatGitHubUrl(url);
        this.branchLink = branchLink;
        this.commitsLink = commitsLink;
        this.headers = { 'Accept': 'application/vnd.github+json', };
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

    static async getRawData() {
        const branchesRes = await fetch(this.branchLink, { headers: this.headers });
        const commitsRes = await fetch(this.commitsLink, { headers: this.headers });

        const branches = await branchesRes.json();
        const commits = await commitsRes.json();
        return { branches, commits };
    };

    async getData () {
        const { branches, commits } = await this.getRawData();
        let commitsDetails = [];

        commits.forEach(commit => {
            const details = {
                author: commit.commit.author,
                message: commit.commit.message,
                url: commit.commit.url,
            };
            
            commitsDetails.push(details);
        });

        return {
            commitsDetails: commitsDetails,
        };
    };
}

const client = new GitHubClient("https://github.com/Bila-sowa/Web-player-");