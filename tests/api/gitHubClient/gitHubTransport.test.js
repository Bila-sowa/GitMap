import GitHubTransport from "@/js/api/gitHubClient/gitHubTransport";
import GitHubRateLimiter from "@/js/api/gitHubClient/gitHubRateLimiter";
import { TestConfig } from "../../tools/testTools";

export default function test_p2t4f_Data() {
    const config = new TestConfig(
        {
            file: "gitHubTransport.js",
            test: "test_p2t4f_Data",
            name: "GitHubTransport",
            type: "class",
        },
        {
            pagination: true,
            safeHeaders: true,
            rateLimitFromHeaders: true,
            noImplicitRefresh: true,
            explicitRefresh: true,
            cancelled: true,
            httpError: true,
        },
    );

    return config.run(async () => {
        const calls = [];
        const headers = { Accept: "application/vnd.github+json", Authorization: "Bearer secret" };
        const rateLimiter = new GitHubRateLimiter();
        const httpApi = { createHttpError: async (response) => ({ error: `HTTP ${response.status}` }) };
        const fetcher = async (url, options) => {
            calls.push({ url, headers: options.headers });

            if (url.endsWith("/rate_limit")) {
                return {
                    ok: true,
                    headers: new Headers(),
                    json: async () => ({ resources: { core: { limit: 60, remaining: 47, used: 13 } } }),
                };
            }

            if (url.includes("page=2")) {
                return {
                    ok: true,
                    headers: new Headers({ "X-RateLimit-Limit": "60", "X-RateLimit-Used": "12" }),
                    json: async () => [{ name: "dev" }],
                };
            }

            return {
                ok: true,
                headers: new Headers({
                    Link: '<https://api.github.com/repos/example/project/branches?page=2>; rel="next"',
                    "X-RateLimit-Limit": "60",
                    "X-RateLimit-Remaining": "49",
                }),
                json: async () => [{ name: "main" }],
            };
        };
        const transport = new GitHubTransport(headers, httpApi, {
            fetcher,
            onResponse: (response) => rateLimiter.updateFromHeaders(response.headers),
        });
        rateLimiter.setTransport(transport);

        const result = await transport.getJson("https://api.github.com/repos/example/project/branches", {
            paginate: true,
        });
        const external = await transport.getJson("https://example.com/data", { parseJson: false });
        const cached = rateLimiter.getCachedRateLimitData();
        const aborted = new AbortController();
        aborted.abort();
        const cancelledTransport = new GitHubTransport(headers, httpApi, {
            fetcher: async (url, options) => {
                if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
            },
        });
        const cancelled = await cancelledTransport.getJson("https://api.github.com/data", {
            signal: aborted.signal,
        });
        const errorTransport = new GitHubTransport(headers, httpApi, {
            fetcher: async () => ({ ok: false, status: 403 }),
        });
        const httpError = await errorTransport.getJson("https://api.github.com/data");
        const noImplicitRefresh = !calls.some((call) => call.url.endsWith("/rate_limit"));
        const refreshed = await rateLimiter.getRateLimitData();

        return {
            pagination: result.success && result.data.map((branch) => branch.name).join(",") === "main,dev",
            safeHeaders: calls.slice(0, 2).every((call) => call.headers.Authorization === "Bearer secret") &&
                calls[2].headers.Authorization === undefined && external.success,
            rateLimitFromHeaders: cached.success && cached.data.limitPerNumber === 60 &&
                cached.data.usedPerNumber === 12 && cached.data.usedPerPercent === 20,
            noImplicitRefresh,
            explicitRefresh: refreshed.success && refreshed.data.usedPerNumber === 13 &&
                calls.filter((call) => call.url.endsWith("/rate_limit")).length === 1,
            cancelled: cancelled.cancelled === true,
            httpError: httpError.error === "HTTP 403",
        };
    });
}
