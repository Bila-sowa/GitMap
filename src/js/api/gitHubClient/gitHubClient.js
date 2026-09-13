import GitHubHttpApi from "./gitHubHttpApi";
import GitHubTokenManager from "./gitHubTokenManager";
import GitHubRateLimiter from "./gitHubRateLimiter";
import GitHubDataParser from "./gitHubDataParser";
import parseGitHubUrl from "./gitHubUrlParser";
import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";

class GitHubClient extends GitHubHttpApi {
    #headers = { Accept: "application/vnd.github+json" };
    #tokenManager;
    #rateLimiter;
    #parser;

    constructor() {
        super();
        this.#tokenManager = new GitHubTokenManager(this.#headers, this);
        this.#rateLimiter = new GitHubRateLimiter(this.#headers, this);
        this.#parser = new GitHubDataParser();

        if (storage.token) this.setToken(storage.token);
    }

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

    async #getRawData(url, options = {}) {
        const formatted = parseGitHubUrl(url);

        if (!formatted.success) return formatted;

        try {
            const [repositoryRes, branchesRes, commitsRes] = await Promise.all([
                fetch(formatted.repositoryLink, {
                    headers: this.#getSafeHeaders(formatted.repositoryLink),
                    signal: options.signal,
                }),
                fetch(formatted.branchLink, {
                    headers: this.#getSafeHeaders(formatted.branchLink),
                    signal: options.signal,
                }),
                fetch(formatted.commitsLink, {
                    headers: this.#getSafeHeaders(formatted.commitsLink),
                    signal: options.signal,
                }),
            ]);

            if (!repositoryRes.ok) {
                const httpError = await this.createHttpError(repositoryRes, formatted.repositoryLink);
                return { success: false, ...httpError };
            }

            if (!branchesRes.ok) {
                const httpError = await this.createHttpError(branchesRes, formatted.branchLink);
                return { success: false, ...httpError };
            }

            if (!commitsRes.ok) {
                const httpError = await this.createHttpError(commitsRes, formatted.commitsLink);
                return { success: false, ...httpError };
            }

            const repository = await repositoryRes.json();
            const branches = await branchesRes.json();
            const commits = await commitsRes.json();

            return {
                success: true,
                defaultBranch: repository.default_branch,
                branches,
                commits,
            };
        } catch (err) {
            if (err.name === "AbortError") {
                return { success: false, cancelled: true };
            }

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

    async getData(url, options = {}) {
        const data = await this.#getRawData(url, options);

        if (!data.success) {
            if (!data.cancelled) notifications.notify(data.error, "error");
            return data;
        }

        await this.getRateLimitData();

        const parsed = this.#parser.parseRepoData(data);

        if (!parsed.success) {
            notifications.notify(parsed.error, "error");
            return parsed;
        }

        return parsed;
    }

    async getDataByBranch(name, url = storage.link, options = {}) {
        const branchName = typeof name === "string" ? name.trim() : "";

        if (!branchName) {
            const error = "Missing branch name";
            const devError = { message: "getDataByBranch requires a valid branch name parameter" };
            notifications.notify(error, "error");
            return { success: false, error, devError };
        }

        const formatted = parseGitHubUrl(url);

        if (!formatted.success) {
            notifications.notify(formatted.error, "error");
            return formatted;
        }

        try {
            const commitsUrl = `${formatted.commitsLink}?sha=${encodeURIComponent(branchName)}`;
            const commitsRes = await fetch(commitsUrl, {
                headers: this.#getSafeHeaders(commitsUrl),
                signal: options.signal,
            });

            if (!commitsRes.ok) {
                const httpError = await this.createHttpError(commitsRes, commitsUrl);
                notifications.notify(httpError.error, "error");
                return { success: false, ...httpError };
            }

            const commits = await commitsRes.json();
            const parsed = this.#parser.parseCommitsData(commits);

            if (!parsed.success) {
                notifications.notify(parsed.error, "error");
            }

            this.getRateLimitData();
            return parsed;
        } catch (err) {
            if (err.name === "AbortError") {
                return { success: false, cancelled: true };
            }

            const error = "Failed to fetch branch commits";
            const devError = {
                message: `Network or fetch exception in getDataByBranch: ${err.message}`,
                stack: err.stack,
            };
            notifications.notify(error, "error");
            return { success: false, error, devError };
        }
    }

    async getCommitFiles(url, sha) {
        const formatted = parseGitHubUrl(url);

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
            return this.#parser.parseCommitFilesData(data);
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

    async setToken(token) {
        return this.#tokenManager.setToken(token);
    }

    async getRateLimitData() {
        return this.#rateLimiter.getRateLimitData();
    }

    checkIsRateLimitHigh(response, percent = 70) {
        return this.#rateLimiter.checkIsRateLimitHigh(response, percent);
    }
}

const gitHubClient = new GitHubClient();

export { GitHubClient };
export default gitHubClient;
