import GitHubHttpApi from "./gitHubHttpApi";
import formatter from "../utils/formatter.js";
import notifications from "../utils/notificationManager.js";
import { escapeHTML } from "../utils/utils.js";
import storage from "../data/storage";

class GitHubClient extends GitHubHttpApi {
    #headers = { Accept: "application/vnd.github+json" };

    constructor() {
        super();
        if (storage.token) this.setToken(storage.token);
    }

    #formatGitHubUrl = (url) => {
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
    };

    #getSafeHeaders(url) {
        const headers = { Accept: this.#headers.Accept };
        let hostname = "";

        try {
            hostname = new URL(url).hostname;
        } catch (error) {
            console.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error);
        }

        if (hostname === "api.github.com" && this.#headers.Authorization) {
            headers.Authorization = this.#headers.Authorization;
        }

        return headers;
    }

    async #getRawData(url) {
        const formatted = this.#formatGitHubUrl(url);

        if (!formatted.success) return formatted;

        try {
            const [branchesRes, commitsRes] = await Promise.all([
                fetch(formatted.branchLink, { headers: this.#getSafeHeaders(formatted.branchLink) }),
                fetch(formatted.commitsLink, { headers: this.#getSafeHeaders(formatted.commitsLink) }),
            ]);

            if (!branchesRes.ok) {
                const httpError = await this.createHttpError(branchesRes, formatted.branchLink);
                return { success: false, ...httpError };
            }

            if (!commitsRes.ok) {
                const httpError = await this.createHttpError(commitsRes, formatted.commitsLink);
                return { success: false, ...httpError };
            }

            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return {
                success: true,
                branches,
                commits,
            };
        } catch (err) {
            return {
                success: false,
                error: "Failed to fetch repository data",
                devError: {
                    message: `Network or fetch exception in #getRawData: ${err.message}`,
                    stack: err.stack,
                },
            };
        }
    }

    #parseData = (data) => {
        const branches = Array.isArray(data.branches) ? data.branches : [];
        const commits = Array.isArray(data.commits) ? data.commits : [];

        if (!branches.length || !commits.length || !data.success) {
            return {
                success: false,
                error: "Unexpected response format from GitHub",
                devError: {
                    message: `Missing data in #parseData: branches count = ${branches.length}, commits count = ${commits.length}`,
                    branches,
                    commits,
                },
            };
        }

        const commitsDetails = [];
        const branchesDetails = [];

        commits.forEach((commit) => {
            const formattedTitle = formatter.getFormattedTitle(commit.commit.message);
            const formattedDescription = formatter.getFormattedDescription(commit.commit.message);
            const formattedDate = formatter.getDateInLocaleString(commit.commit.author.date);
            const shortHash = formatter.getShortHash(commit.sha);

            const details = {
                author: {
                    name: escapeHTML(commit.commit.author.name),
                    email: escapeHTML(commit.commit.author.email),
                    avatar: commit.author?.avatar_url,
                    url: commit.author?.html_url,
                    date: formattedDate,
                },
                title: escapeHTML(formattedTitle),
                description: formattedDescription ? escapeHTML(formattedDescription) : "",
                hash: shortHash,
                url: commit.html_url,
                sha: commit.sha,
            };

            commitsDetails.push(details);
        });

        branches.forEach((branch) => {
            const details = { name: escapeHTML(branch.name) };
            branchesDetails.push(details);
        });

        return { success: true, commitsDetails, branchesDetails };
    };

    async getData(url) {
        const data = await this.#getRawData(url);

        if (!data.success) {
            notifications.notify(data.error, "error");
            return data;
        }

        await this.getRateLimitData();

        const parsed = this.#parseData(data);

        if (!parsed.success) {
            notifications.notify(parsed.error, "error");
            return parsed;
        }

        return parsed;
    }

    #parseCommitFiles = (data) => {
        const files = Array.isArray(data.files) ? data.files : [];
        const formattedData = [];

        files.forEach((file) => {
            const extension = formatter.getFormattedExtension(file.filename);
            const status = formatter.getShortStatus(file.status);

            const fileData = {
                name: escapeHTML(file.filename),
                additions: file.additions,
                deletions: file.deletions,
                extension: escapeHTML(extension),
                fullStatus: file.status,
                status: status,
            };

            formattedData.push(fileData);
        });

        return {
            success: true,
            files: formattedData,
            truncated: files.length === 300,
        };
    };

    async getCommitFiles(url, sha) {
        const formatted = this.#formatGitHubUrl(url);

        if (!formatted.success) {
            notifications.notify(formatted.error, "error");
            return formatted;
        }

        if (!sha) {
            const error = "Missing commit SHA";
            const devError = { message: "getCommitFiles requires a valid commit SHA parameter" };
            notifications.notify(error, "error");
            return { success: false, error, devError };
        }

        await this.getRateLimitData();

        try {
            const commitUrl = `${formatted.commitsLink}/${sha}`;
            const fileRes = await fetch(commitUrl, {
                headers: this.#getSafeHeaders(commitUrl),
            });

            if (!fileRes.ok) {
                const httpError = await this.createHttpError(fileRes, commitUrl);
                notifications.notify(httpError.error, "error");
                return { success: false, ...httpError };
            }

            const data = await fileRes.json();
            const parsed = this.#parseCommitFiles(data);

            return parsed;
        } catch (err) {
            const error = "Failed to fetch commit files";
            const devError = {
                message: `Network or fetch exception in getCommitFiles: ${err.message}`,
                stack: err.stack,
            };
            notifications.notify(error, "error");
            return { success: false, error, devError };
        }
    }

    checkIsRateLimitHigh(response, percent = 70) {
        if (
            response?.success &&
            typeof response.data?.usedPerPercent === "number" &&
            response.data.usedPerPercent >= percent
        ) {
            notifications.notify(
                `GitHub API rate limit is above ${percent}%. Consider reducing request volume or adding a personal access token.`,
                "warning",
            );
        }

        return response;
    }

    async #validateToken() {
        try {
            const url = "https://api.github.com/rate_limit";
            const res = await fetch(url, {
                headers: this.#getSafeHeaders(url),
            });

            if (!res.ok) {
                const httpError = await this.createHttpError(res, url);
                return { success: false, ...httpError };
            }

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: "Failed to validate GitHub token",
                devError: {
                    message: `Network or fetch exception in #validateToken: ${err.message}`,
                    stack: err.stack,
                },
            };
        }
    }

    async setToken(token) {
        if (!token) {
            delete this.#headers.Authorization;
            delete storage.token;
            return { success: true };
        }

        storage.token = token;
        this.#headers.Authorization = `Bearer ${token}`;
        const validation = await this.#validateToken();

        if (!validation.success) {
            delete this.#headers.Authorization;
            delete storage.token;
            notifications.notify(validation.error, "error");
            return validation;
        }

        notifications.notify("The token has been successfully set", "success");
        return { success: true };
    }

    async getRateLimitData() {
        try {
            const url = "https://api.github.com/rate_limit";
            const res = await fetch(url, {
                headers: this.#getSafeHeaders(url),
            });

            if (!res.ok) {
                const httpError = await this.createHttpError(res, url);
                notifications.notify(httpError.error, "error");
                return {
                    success: false,
                    ...httpError,
                    data: { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 },
                };
            }

            const data = await res.json();

            if (!data?.resources?.core) {
                const error = "Invalid rate limit response format";
                const devError = {
                    message: "Missing data.resources.core in GitHub rate_limit response",
                    rawResponse: data,
                };
                notifications.notify(error, "error");
                return {
                    success: false,
                    error,
                    devError,
                    data: { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 },
                };
            }

            const { limit, remaining, used } = data.resources.core;
            const usedCount = used !== undefined ? used : limit - remaining;
            const formattedPercent = limit > 0 ? Number(((usedCount / limit) * 100).toFixed(2)) : 0;

            const response = {
                success: true,
                data: {
                    limitPerNumber: limit,
                    usedPerNumber: usedCount,
                    usedPerPercent: formattedPercent,
                },
            };

            this.checkIsRateLimitHigh(response);
            return response;
        } catch (err) {
            const error = "Failed to fetch rate limit data";
            const devError = {
                message: `Network or fetch exception in getRateLimitData: ${err.message}`,
                stack: err.stack,
            };
            notifications.notify(error, "error");
            return {
                success: false,
                error,
                devError,
                data: { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 },
            };
        }
    }
}

const gitHubClient = new GitHubClient();

export { GitHubClient };
export default gitHubClient;
