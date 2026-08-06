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
                if (branchesRes.status === 403 || commitsRes.status === 403 ) {
                    // showMessage("")
                    throw new Error(`Hourly request limit reached or invalid URL. Status: ${branchesRes.status} / ${commitsRes.status}`);
                } else {
                    throw new Error(`GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
                };
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return { branches, commits, success: true };

        } catch(err) {
            // showError(err.message);
            return { error: err.message, success: false};
        }
    };

    async getData () {
        const data = await this.getRawData();
        if (!data.success) return { error: data.error, success: false };

        const { branches, commits } = data;

        if (!Array.isArray(branches) || !Array.isArray(commits)) {
            return { error: 'Unexpected GitHub API response format', success: false };
        }
        
        let commitsDetails = [];
        let branchesDetails = [];
        

        commits.forEach(commit => {
            const formattedTitle = commit.commit.message.split('\n')[0];
            const formattedDescription = commit.commit.message.split('\n').slice(1).join('\n');
            const formattedDate = new Date(`${commit.commit.author.date}`).toLocaleString();
            const shortHash = commit.sha.slice(0, 7);

            const details = {
                author: {
                    name: commit.commit.author.name,
                    email: commit.commit.author.email,
                    avatar: commit.author.avatar_url,
                    url: commit.author.html_url,
                    date: formattedDate,
                },
                title: formattedTitle,
                description: formattedDescription ? formattedDescription : "",
                hash: shortHash,
                url: commit.html_url,
                sha: commit.sha
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
            success: true,
        };
    };

    async getRateLimit() {
        try {
            const tokenRes = await fetch('https://api.github.com/rate_limit', { headers: this.headers });

            if (!tokenRes.ok) {
                throw new Error(`GitHub API error: ${tokenRes.status}`);
            }

            const data = await tokenRes.json();
            const { limit, remaining, reset, used } = data.rate;
            
            return {
                limit,
                remaining,
                used,
                success: true,
            };
        } catch (err) {
            return { error: err.message, success: false };
        }
    };



    async getCommitFiles(sha) {
        try {
            const fileRes = await fetch(`${this.commitsLink}/${sha}`, { headers: this.headers });

            if (!fileRes.ok) throw new Error(`GitHub API error: ${res.status}`);

            const data = await fileRes.json();
            let formattedData = [];

            data.files.forEach(file => {
                const extension = file.filename.slice(file.filename.lastIndexOf('.') + 1);
                const status = file.status.slice(0, 1).toUpperCase();

                const fileData = {
                    name: file.filename,
                    additions: file.additions,
                    deletions: file.deletions,
                    extension: extension,
                    fullStatus: file.status,
                    status: status,
                };

                formattedData.push(fileData);
            });

            return {
                files: formattedData, 
                success: true,
            };
        } catch (err) {
            console.error(`Failed to fetch files for commit ${sha}: ${err.message}`);
            return { error: err.message, success: false };
        }
    };

    async setToken(token) {
        if (!token) {
            delete this.headers.Authorization;
            return;
        }

        this.headers.Authorization = `Bearer ${token}`;
        const validation = await this.validateToken();

        if (!validation.success) {
            delete this.headers.Authorization;
            console.error(`Invalid token: ${validation.error}. Falling back to no-token mode.`);
        }
    };

    async validateToken() {
        try {
            const res = await fetch('https://api.github.com/user', { headers: this.headers });

            if (res.status === 401) throw new Error('Token is invalid or expired');
            if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

            const { login } = await res.json();
            return { success: true, login };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };


};

export default GitHubClient;
