import notifications from "@/js/utils/notificationManager";

class GitHubRateLimiter {
    #headers;
    #httpApi;

    constructor(headers, httpApi) {
        this.#headers = headers;
        this.#httpApi = httpApi;
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
                const httpError = await this.#httpApi.createHttpError(res, url);
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

export default GitHubRateLimiter;
