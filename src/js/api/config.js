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
        gitHub: {
            REQUEST_TIMEOUT_MS: 15000,
        },
        notifications: {
            showNotifications: true,
            COOLDOWN_MS: 5000,
        },
        loader: {
            showLoader: false,
            CLEANUP_TIMEOUT_MS: 30000,
        },
    };
};

const mergeConfigs = (invalidConfig) => {
    const defaultConfig = getDefaultConfig();
    const config =
        invalidConfig && typeof invalidConfig === "object" && !Array.isArray(invalidConfig) ? invalidConfig : {};

    return {
        name: typeof config.name === "string" && config.name.trim() ? config.name : defaultConfig.name,
        debug: typeof config.debug === "boolean" ? config.debug : defaultConfig.debug,
        versionDetails: {
            version:
                typeof config.versionDetails?.version === "string" && config.versionDetails.version.trim()
                    ? config.versionDetails.version
                    : defaultConfig.versionDetails.version,
            versionType:
                typeof config.versionDetails?.versionType === "string" && config.versionDetails.versionType.trim()
                    ? config.versionDetails.versionType
                    : defaultConfig.versionDetails.versionType,
            versionIsStable:
                typeof config.versionDetails?.versionIsStable === "boolean"
                    ? config.versionDetails.versionIsStable
                    : defaultConfig.versionDetails.versionIsStable,
        },
        graph: {
            renderLimit:
                Number.isInteger(config.graph?.renderLimit) && config.graph.renderLimit > 0
                    ? config.graph.renderLimit
                    : defaultConfig.graph.renderLimit,
        },
        gitHub: {
            REQUEST_TIMEOUT_MS:
                Number.isInteger(config.gitHub?.REQUEST_TIMEOUT_MS) &&
                config.gitHub.REQUEST_TIMEOUT_MS >= 1000 &&
                config.gitHub.REQUEST_TIMEOUT_MS <= 120000
                    ? config.gitHub.REQUEST_TIMEOUT_MS
                    : defaultConfig.gitHub.REQUEST_TIMEOUT_MS,
        },
        notifications: {
            showNotifications:
                typeof config.notifications?.showNotifications === "boolean"
                    ? config.notifications.showNotifications
                    : defaultConfig.notifications.showNotifications,
            COOLDOWN_MS:
                Number.isFinite(config.notifications?.COOLDOWN_MS) &&
                config.notifications.COOLDOWN_MS >= 0 &&
                config.notifications.COOLDOWN_MS <= 60000
                    ? config.notifications.COOLDOWN_MS
                    : defaultConfig.notifications.COOLDOWN_MS,
        },
        loader: {
            showLoader:
                typeof config.loader?.showLoader === "boolean"
                    ? config.loader.showLoader
                    : defaultConfig.loader.showLoader,
            CLEANUP_TIMEOUT_MS:
                Number.isInteger(config.loader?.CLEANUP_TIMEOUT_MS) &&
                config.loader.CLEANUP_TIMEOUT_MS >= 1000 &&
                config.loader.CLEANUP_TIMEOUT_MS <= 120000
                    ? config.loader.CLEANUP_TIMEOUT_MS
                    : defaultConfig.loader.CLEANUP_TIMEOUT_MS,
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

        return mergeConfigs(configData);
    } catch (error) {
        console.error("Returning default config, error fetching config:", error);
        return getDefaultConfig();
    }
};

const config = await getConfigData();

export { config, getConfigData, getDefaultConfig, mergeConfigs };
