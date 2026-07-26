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

    async getRawData() {
        try {
            const branchesRes = await fetch(this.branchLink, { headers: this.headers });
            const commitsRes = await fetch(this.commitsLink, { headers: this.headers });
            console.log(branchesRes.status)
            if (!branchesRes.ok || !commitsRes.ok) {
                throw new Error(`GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return { branches, commits };
        } catch(err) {
            console.log("The repo must be public.");
            // showState("error", `GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
            throw new Error(`Invalid GitHub Repo ${err.message}`);
        }
    };

    async getData () {
        const rawData = await this.getRawData();

        if(!rawData) return null;

        const { branches, commits } = rawData;
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
};

