export default async function getRateLimit() {
    try {
        const tokenRes = await fetch('https://api.github.com/rate_limit');

        if (!tokenRes.ok) {
            throw new Error(`GitHub API error: ${tokenRes.status}`);
        }

        const data = await tokenRes.json();
        const { limit, remaining, reset, used } = data.rate;

        if (!data) {
            return { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 };
        }

        return {
            limitPerNumber: data.rate?.limit,
            usedPerNumber: data.rate?.remaining,
            usedPerPercent: (data.rate?.remaining / data.rate?.limit) * 100,
        };
    } catch (err) {
        return { error: err.message, success: false };
    }
};
