import Formatter from "../utils/formatter.js";
import { createNotification } from "../utils/utils.js";

class GitHubClient {
    #formatter = new Formatter();

    constructor(url) {
        const result = GitHubClient.formatGitHubUrl(url);

        if (!result.success) {
            this.branchLink = null;
            this.commitsLink = null;
            this.headers = { "Accept": "application/vnd.github+json" };
            return;
        }

        this.branchLink = result.data.branchLink;
        this.commitsLink = result.data.commitsLink;
        this.headers = { "Accept": "application/vnd.github+json" };
    }

    static formatGitHubUrl(url) {
        if (!url || typeof url !== "string" || !url.trim()) {
            createNotification("GitHub repository URL is missing", "error");
            return { error: "Missing GitHub URL", success: false };
        }

        try {
            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) throw new Error("Invalid GitHub URL");

            const [, owner, repo] = match;
            const cleanRepo = repo.replace(/\.git$/, "").replace(/\/$/, "");

            return {
                data: {
                    branchLink: `https://api.github.com/repos/${owner}/${cleanRepo}/branches`,
                    commitsLink: `https://api.github.com/repos/${owner}/${cleanRepo}/commits`,
                },
                success: true,
            };
        } catch (err) {
            createNotification("Invalid GitHub URL", "error");
            return { error: err.name, success: false };
        }

    };

    async getRawData() {
        try {
            if (!this.branchLink || !this.commitsLink) {
                return { error: "Repository URL is missing or invalid", success: false };
            }

            const branchesRes = await fetch(this.branchLink, { headers: this.headers });
            const commitsRes = await fetch(this.commitsLink, { headers: this.headers });

            if (!branchesRes.ok || !commitsRes.ok) {
                if (branchesRes.status === 403 || commitsRes.status === 403) {
                    window.location = "./limit.html"
                    return;
                } else {
                    throw new Error(`GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
                };
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return { branches, commits, success: true };

        } catch (err) {
            createNotification("Invalid GitHub URL or private repo", "error");
            return { error: err.message, success: false };
        }
    };

    async getData() {
        const data = await this.getRawData();
        if (!data?.success) {
            return { success: false, error: data?.error || "Failed to retrieve data" };
        }

        const branches = Array.isArray(data.branches) ? data.branches : [];
        const commits = Array.isArray(data.commits) ? data.commits : [];

        if (!branches.length || !commits.length) {
            createNotification("Unexpected GitHub API response format", "error");
            return { success: false, error: "Unexpected GitHub API response format" };
        }

        const commitsDetails = [];
        const branchesDetails = [];

        commits.forEach(commit => {
            const formattedTitle = this.#formatter.getFormattedTitle(commit.commit.message);
            const formattedDescription = this.#formatter.getFormattedDescription(commit.commit.message);
            const formattedDate = this.#formatter.getFormattedDate(commit.commit.author.date);
            const shortHash = this.#formatter.getFormattedHash(commit.sha);

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
            commitsDetails,
            branchesDetails,
            success: true,
        };
    };

    async getCommitFiles(sha) {
        try {
            if (!this.commitsLink || !sha) {
                return { error: "Commit SHA or repository URL is missing", success: false };
            }

            const fileRes = await fetch(`${this.commitsLink}/${sha}`, { headers: this.headers });

            if (!fileRes.ok) throw new Error(`GitHub API error: ${fileRes.status}`);

            const data = await fileRes.json();
            let formattedData = [];

            data.files.forEach(file => {
                const extension = file.filename.slice(file.filename.lastIndexOf(".") + 1);
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
            createNotification(`Failed to fetch files for commit ${sha}: ${err.message}`, "error")
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
            createNotification(`Invalid token: ${validation.error}. Falling back to no-token mode.`, "error");
        }
    };

    async validateToken() {
        try {
            const res = await fetch("https://api.github.com/user", { headers: this.headers });

            if (!res.ok) {
                return { success: false, error: `GitHub token validation failed: ${res.status}` };
            }

            const data = await res.json();
            if (!data?.login) {
                return { success: false, error: "GitHub token validation failed" };
            }

            return { success: true, login: data.login };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };


};

export default GitHubClient;

