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

    async #getRawData(url) {
        const formatted = parseGitHubUrl(url);

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

    async getData(url) {
        const data = await this.#getRawData(url);

        if (!data.success) {
            notifications.notify(data.error, "error");
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
