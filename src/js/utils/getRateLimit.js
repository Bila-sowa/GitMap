import { createNotification } from "./utils.js";

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

        const formattedPercent = ((remaining / limit) * 100).toFixed(2);

        return {
            data: {
                limitPerNumber: data.rate?.limit,
                usedPerNumber: data.rate?.remaining,
                usedPerPercent: formattedPercent,
            },
            success: true
        };
    } catch (err) {
        createNotification("File data request error", "error")
        return { error: err.message, success: false };
    }
};
