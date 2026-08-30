import notifications from "@/js/utils/notificationManager";
import storage from "@/js/data/storage";
import GitHubHttpApi from "./gitHubHttpApi";

class GitHubRateLimiter extends GitHubHttpApi {
    #headers = { Accept: "application/vnd.github+json" };

    #getSafeHeaders(url) {
        const headers = { Accept: this.#headers.Accept };
        let hostname = "";

        try {
            hostname = new URL(url).hostname;
        } catch (error) {
            console.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error);
        }

        const token = storage.token;
        const auth = token ? `Bearer ${token}` : this.#headers.Authorization;

        if (hostname === "api.github.com" && auth) {
            headers.Authorization = auth;
        }

        return headers;
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

const gitHubRateLimiter = new GitHubRateLimiter();

export { GitHubRateLimiter };
export default gitHubRateLimiter;
