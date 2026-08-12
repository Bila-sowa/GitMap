import Formatter from "../utils/formatter.js";
import { createNotification } from "../utils/utils.js";


export default class GitHubClient {
    #formatter = new Formatter();
    #headers = { "Accept": "application/vnd.github+json" };

    #formatGitHubUrl = (url) => {
        try {
            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) throw new Error("Invalid GitHub URL");

            const [, owner, repo] = match;
            const cleanRepo = repo.replace(/\.git$/, "").replace(/\/$/, "");

            return {
                success: true,
                branchLink: `https://api.github.com/repos/${owner}/${cleanRepo}/branches`,
                commitsLink: `https://api.github.com/repos/${owner}/${cleanRepo}/commits`,
            };
        } catch (err) {
            return { success: false };
        }
    };

    async #getRawData(url) {
        const formatted = this.#formatGitHubUrl(url);

        if (!formatted.success) return formatted;

        try {
            const branchesRes = await fetch(formatted.branchLink, { headers: this.#headers });
            const commitsRes = await fetch(formatted.commitsLink, { headers: this.#headers });

            if (!branchesRes.ok || !commitsRes.ok) {
                if (branchesRes.status === 403 || commitsRes.status === 403) {
                    return { success: false };
                } else {
                    throw new Error(`GitHub API error: ${branchesRes.status} / ${commitsRes.status}`);
                }
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return {
                success: true,
                branches,
                commits,
            };

        } catch (err) {
            return { success: false };
        }
    };

    #parseData = (data) => {
        const branches = Array.isArray(data.branches) ? data.branches : [];
        const commits = Array.isArray(data.commits) ? data.commits : [];

        if (!branches.length || !commits.length) {
            return { success: false };
        }

        const commitsDetails = [];
        const branchesDetails = [];

        commits.forEach(commit => {
            const formattedTitle = this.#formatter.getFormattedTitle(commit.commit.message);
            const formattedDescription = this.#formatter.getFormattedDescription(commit.commit.message);
            const formattedDate = this.#formatter.getDateInLocaleString(commit.commit.author.date);
            const shortHash = this.#formatter.getShortHash(commit.sha);

            const details = {
                author: {
                    name: commit.commit.author.name,
                    email: commit.commit.author.email,
                    avatar: commit.author?.avatar_url,
                    url: commit.author?.html_url,
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
        });

        return { success: true, commitsDetails, branchesDetails };
    };

    async getData(url) {
        const data = await this.#getRawData(url);

        if (!data.success) {
            createNotification("Failed to fetch repository data", "error");
            return data;
        }

        const parsed = this.#parseData(data);

        if (!parsed.success) {
            createNotification("Unexpected response format from GitHub", "error");
            return parsed;
        }

        return parsed;
    };

    #parseCommitFiles = (data) => {
        const files = Array.isArray(data.files) ? data.files : [];
        const formattedData = [];

        data.files.forEach(file => {
            const extension = this.#formatter.getFormattedExtension(file);
            const status = this.#formatter.getShortStatus(file);

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
            success: true,
            files: formattedData,
        };
    };

    async getCommitFiles(url, sha) {
        const formatted = this.#formatGitHubUrl(url);

        if (!formatted.success || !sha) {
            return { success: false };
        }

        try {
            const fileRes = await fetch(`${formatted.commitsLink}/${sha}`, { headers: this.#headers });

            if (!fileRes.ok) throw new Error(`GitHub API error: ${fileRes.status}`);

            const data = await fileRes.json();
            const parsed = this.#parseCommitFiles(data);

            return parsed;
        } catch (err) {
            return { success: false };
        }
    };


    async #validateToken() {
        try {
            const res = await fetch("https://api.github.com/user", { headers: this.#headers });

            if (!res.ok) {
                return { success: false };
            }

            const data = await res.json();
            if (!data?.login) {
                return { success: false };
            }

            return { success: true, login: data.login };
        } catch (err) {
            return { success: false };
        }
    };

    async setToken(token) {
        if (!token) {
            delete this.#headers.Authorization;
            return { success: true };
        }

        this.#headers.Authorization = `Bearer ${token}`;
        const validation = await this.#validateToken();

        if (!validation.success) {
            delete this.#headers.Authorization;
            createNotification("Invalid GitHub token", "error");
            return validation;
        }

        return { success: true, login: validation.login };
    };
};
