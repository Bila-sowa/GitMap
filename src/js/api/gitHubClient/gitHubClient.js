import GitHubHttpApi from "./gitHubHttpApi";
import GitHubTokenManager from "./gitHubTokenManager";
import GitHubRateLimiter from "./gitHubRateLimiter";
import GitHubDataParser from "./gitHubDataParser";
import parseGitHubUrl from "./gitHubUrlParser";
import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";

class GitHubClient extends GitHubHttpApi {
    #headers = {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
    };
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
        const headers = {
            Accept: this.#headers.Accept,
            "Content-Type": "application/json",
        };
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

        const { owner, repo } = formatted;
        const graphqlUrl = "https://api.github.com/graphql";

        const query = `
            query ($owner: String!, $name: String!) {
                repository(owner: $owner, name: $name) {
                    isEmpty
                    refs(refPrefix: "refs/heads/", first: 100) {
                        nodes {
                            name
                        }
                    }
                    defaultBranchRef {
                        target {
                            ... on Commit {
                                history(first: 30) {
                                    nodes {
                                        oid
                                        message
                                        url
                                        author {
                                            name
                                            email
                                            date
                                            avatarUrl
                                            user {
                                                url
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            const res = await fetch(graphqlUrl, {
                method: "POST",
                headers: this.#getSafeHeaders(graphqlUrl),
                body: JSON.stringify({
                    query,
                    variables: { owner, name: repo },
                }),
            });

            if (!res.ok) {
                throw res;
            }

            const body = await res.json();

            if (body.errors?.length) {
                const primaryError = body.errors[0];
                const status = primaryError.type === "NOT_FOUND" ? 404 : 400;
                throw new Response(JSON.stringify({ message: primaryError.message }), { status });
            }

            const repository = body.data?.repository;
            if (!repository) {
                throw new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
            }

            if (repository.isEmpty || !repository.defaultBranchRef) {
                throw new Response(JSON.stringify({ message: "Git Repository is empty." }), { status: 409 });
            }

            const branches = repository.refs?.nodes || [];
            const commits = repository.defaultBranchRef.target?.history?.nodes || [];

            return {
                success: true,
                branches,
                commits,
            };
        } catch (err) {
            if (err instanceof Response || typeof err?.status === "number") {
                const httpError = await this.createHttpError(err, graphqlUrl);
                return { success: false, ...httpError };
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
                throw fileRes;
            }

            const data = await fileRes.json();
            return this.#parser.parseCommitFilesData(data);
        } catch (err) {
            if (err instanceof Response || typeof err?.status === "number") {
                const httpError = await this.createHttpError(err, `${formatted.commitsLink}/${sha}`);
                notifications.notify(httpError.error, "error");
                return { success: false, ...httpError };
            }

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
