const getDefaultConfig = () => {
    return {
        name: "GitMap",
        debug: false,
        versionDetails: {
            version: "not found",
            versionType: "not found",
            versionIsStable: false,
        },
        graph: {
            renderLimit: 30,
        },
        notifications: {
            showNotifications: true,
            COOLDOWN_MS: 5000,
        },
    };
};

const getConfigData = async (url = `${import.meta.env.BASE_URL}config.json`) => {
    try {
        const configRes = await fetch(url);

        if (!configRes.ok) {
            throw new Error(`Failed to load config.json: ${configRes.status}`);
        }

        const configData = await configRes.json();

        if (!Object.entries(configData).length) {
            throw new Error("Config is empty");
        }

        return configData;
    } catch (error) {
        console.error("Returning default config, error fetching config:", error);
        return getDefaultConfig();
    }
};

export default getConfigData;
