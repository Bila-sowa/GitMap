import GitHubHttpApi from "./gitHubHttpApi";
import GitHubTokenManager from "./gitHubTokenManager";
import GitHubRateLimiter from "./gitHubRateLimiter";
import GitHubDataParser from "./gitHubDataParser";
import parseGitHubUrl from "./gitHubUrlParser";
import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";
import GitHubTransport from "./gitHubTransport";

class GitHubClient extends GitHubHttpApi {
    #headers = { Accept: "application/vnd.github+json" };
    #tokenManager;
    #rateLimiter;
    #parser;
    #transport;

    constructor() {
        super();
        this.#rateLimiter = new GitHubRateLimiter();
        this.#transport = new GitHubTransport(this.#headers, this, {
            onResponse: (response) => this.#rateLimiter.updateFromHeaders(response.headers),
        });
        this.#rateLimiter.setTransport(this.#transport);
        this.#tokenManager = new GitHubTokenManager(this.#headers, this, storage, undefined, this.#transport);
        this.#parser = new GitHubDataParser();
    }

    async #getRawData(url, options = {}) {
        const formatted = parseGitHubUrl(url);

        if (!formatted.success) return formatted;

        const requestOptions = {
            signal: options.signal,
            error: "Failed to fetch repository data",
            context: "#getRawData",
        };
        const [repository, branches, commits] = await Promise.all([
            this.#transport.getJson(formatted.repositoryLink, requestOptions),
            this.#transport.getJson(formatted.branchLink, { ...requestOptions, paginate: true }),
            this.#transport.getJson(formatted.commitsLink, requestOptions),
        ]);

        for (const result of [repository, branches, commits]) {
            if (!result.success) return result;
        }

        return {
            success: true,
            defaultBranch: repository.data?.default_branch,
            branches: branches.data,
            commits: commits.data,
        };
    }

    async getData(url, options = {}) {
        const data = await this.#getRawData(url, options);

        if (!data.success) {
            if (!data.cancelled) notifications.notify(data.error, "error");
            return data;
        }

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

        const commitsUrl = `${formatted.commitsLink}?sha=${encodeURIComponent(branchName)}`;
        const result = await this.#transport.getJson(commitsUrl, {
            signal: options.signal,
            error: "Failed to fetch branch commits",
            context: "getDataByBranch",
        });

        if (!result.success) {
            if (!result.cancelled) notifications.notify(result.error, "error");
            return result;
        }

        const parsed = this.#parser.parseCommitsData(result.data);
        if (!parsed.success) notifications.notify(parsed.error, "error");
        return parsed;
    }

    async getCommitFiles(url, sha, options = {}) {
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

        const commitUrl = `${formatted.commitsLink}/${sha}`;
        const result = await this.#transport.getJson(commitUrl, {
            signal: options.signal,
            error: "Failed to fetch commit files",
            context: "getCommitFiles",
        });

        if (!result.success) {
            if (!result.cancelled) notifications.notify(result.error, "error");
            return result;
        }

        return this.#parser.parseCommitFilesData(result.data);
    }

    async setToken(token, options = {}) {
        return await this.#tokenManager.setToken(token, options);
    }

    async getRateLimitData(options = {}) {
        return await this.#rateLimiter.getRateLimitData(options);
    }

    checkIsRateLimitHigh(response, percent = 70) {
        return this.#rateLimiter.checkIsRateLimitHigh(response, percent);
    }
}

const gitHubClient = new GitHubClient();

export { GitHubClient };
export default gitHubClient;
