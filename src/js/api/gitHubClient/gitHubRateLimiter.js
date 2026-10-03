import notifications from "@/js/utils/notificationManager";

class GitHubRateLimiter {
    #transport;
    #latestResponse;

    constructor() {
        this.#latestResponse = null;
    }

    setTransport(transport) {
        this.#transport = transport;
    }

    updateFromHeaders(headers) {
        const limitHeader = headers?.get?.("X-RateLimit-Limit") ?? null;
        const remainingHeader = headers?.get?.("X-RateLimit-Remaining") ?? null;
        const usedHeader = headers?.get?.("X-RateLimit-Used") ?? null;
        if (limitHeader === null) return;
        if (usedHeader === null && remainingHeader === null) return;

        const limit = Number(limitHeader);
        const used = usedHeader === null ? limit - Number(remainingHeader) : Number(usedHeader);

        if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(used) || used < 0) return;

        const response = {
            success: true,
            data: {
                limitPerNumber: limit,
                usedPerNumber: used,
                usedPerPercent: Number(((used / limit) * 100).toFixed(2)),
            },
        };

        const wasHigh = this.#latestResponse?.data.usedPerPercent >= 70;
        this.#latestResponse = response;
        if (!wasHigh) this.checkIsRateLimitHigh(response);
    }

    getCachedRateLimitData() {
        return this.#latestResponse;
    }

    checkIsRateLimitHigh(response, percent = 70) {
        if (
            response?.success &&
            typeof response.data?.usedPerPercent === "number" &&
            response.data.usedPerPercent >= percent &&
            response.data.usedPerPercent !== 100
        ) {
            notifications.notify(
                `GitHub API rate limit is above ${percent}%. Consider reducing request volume or adding a personal access token.`,
                "warning",
            );
        }

        return response;
    }

    async getRateLimitData(options = {}) {
        const result = await this.#transport.getJson("https://api.github.com/rate_limit", {
            signal: options.signal,
            error: "Failed to fetch rate limit data",
            context: "getRateLimitData",
        });
        const emptyData = { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 };

        if (!result.success) {
            if (!result.cancelled) notifications.notify(result.error, "error");
            return { ...result, data: emptyData };
        }

        const core = result.data?.resources?.core;
        if (!core) {
            const error = "Invalid rate limit response format";
            notifications.notify(error, "error");
            return {
                success: false,
                error,
                devError: {
                    message: "Missing data.resources.core in GitHub rate_limit response",
                    rawResponse: result.data,
                },
                data: emptyData,
            };
        }

        const { limit, remaining, used } = core;
        const usedCount = used !== undefined ? used : limit - remaining;
        const response = {
            success: true,
            data: {
                limitPerNumber: limit,
                usedPerNumber: usedCount,
                usedPerPercent: limit > 0 ? Number(((usedCount / limit) * 100).toFixed(2)) : 0,
            },
        };

        this.#latestResponse = response;
        this.checkIsRateLimitHigh(response);
        return response;
    }
}

export default GitHubRateLimiter;
