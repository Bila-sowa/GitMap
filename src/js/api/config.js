const getDefaultConfig = () => {
  return {
    name: 'GitMap',
    debug: true,
    versionDetails: {
      version: '2.14.1',
      versionType: 'beta',
      versionIsStable: true,
    },

    settings: {
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
        showLoader: true,
        CLEANUP_TIMEOUT_MS: 30000,
      },
      linkHistory: {
        HIDE_DELAY_MS: 5000,
        LINK_HISTORY_LIMIT: 3,
      },
    },
  }
}

const mergeConfigs = (invalidConfig) => {
  const defaultConfig = getDefaultConfig()
  const config =
    invalidConfig && typeof invalidConfig === 'object' && !Array.isArray(invalidConfig)
      ? invalidConfig
      : {}

  return {
    name: typeof config.name === 'string' && config.name.trim() ? config.name : defaultConfig.name,
    debug: typeof config.debug === 'boolean' ? config.debug : defaultConfig.debug,
    versionDetails: {
      version:
        typeof config.versionDetails?.version === 'string' && config.versionDetails.version.trim()
          ? config.versionDetails.version
          : defaultConfig.versionDetails.version,
      versionType:
        typeof config.versionDetails?.versionType === 'string' &&
        config.versionDetails.versionType.trim()
          ? config.versionDetails.versionType
          : defaultConfig.versionDetails.versionType,
      versionIsStable:
        typeof config.versionDetails?.versionIsStable === 'boolean'
          ? config.versionDetails.versionIsStable
          : defaultConfig.versionDetails.versionIsStable,
    },

    settings: {
      graph: {
        renderLimit:
          Number.isInteger(config.settings?.graph?.renderLimit) &&
          config.settings.graph.renderLimit > 0
            ? config.settings.graph.renderLimit
            : defaultConfig.settings.graph.renderLimit,
      },
      gitHub: {
        REQUEST_TIMEOUT_MS:
          Number.isInteger(config.settings?.gitHub?.REQUEST_TIMEOUT_MS) &&
          config.settings.gitHub.REQUEST_TIMEOUT_MS >= 1000 &&
          config.settings.gitHub.REQUEST_TIMEOUT_MS <= 120000
            ? config.settings.gitHub.REQUEST_TIMEOUT_MS
            : defaultConfig.settings.gitHub.REQUEST_TIMEOUT_MS,
      },
      notifications: {
        showNotifications:
          typeof config.settings?.notifications?.showNotifications === 'boolean'
            ? config.settings.notifications.showNotifications
            : defaultConfig.settings.notifications.showNotifications,
        COOLDOWN_MS:
          Number.isFinite(config.settings?.notifications?.COOLDOWN_MS) &&
          config.settings.notifications.COOLDOWN_MS >= 0 &&
          config.settings.notifications.COOLDOWN_MS <= 60000
            ? config.settings.notifications.COOLDOWN_MS
            : defaultConfig.settings.notifications.COOLDOWN_MS,
      },
      loader: {
        showLoader:
          typeof config.settings?.loader?.showLoader === 'boolean'
            ? config.settings.loader.showLoader
            : defaultConfig.settings.loader.showLoader,
        CLEANUP_TIMEOUT_MS:
          Number.isInteger(config.settings?.loader?.CLEANUP_TIMEOUT_MS) &&
          config.settings.loader.CLEANUP_TIMEOUT_MS >= 1000 &&
          config.settings.loader.CLEANUP_TIMEOUT_MS <= 120000
            ? config.settings.loader.CLEANUP_TIMEOUT_MS
            : defaultConfig.settings.loader.CLEANUP_TIMEOUT_MS,
      },
      linkHistory: {
        HIDE_DELAY_MS:
          Number.isInteger(config.settings?.linkHistory?.HIDE_DELAY_MS) &&
          config.settings.linkHistory.HIDE_DELAY_MS >= 0 &&
          config.settings.linkHistory.HIDE_DELAY_MS <= 60000
            ? config.settings.linkHistory.HIDE_DELAY_MS
            : defaultConfig.settings.linkHistory.HIDE_DELAY_MS,
        LINK_HISTORY_LIMIT:
          Number.isInteger(config.settings?.linkHistory?.LINK_HISTORY_LIMIT) &&
          config.settings.linkHistory.LINK_HISTORY_LIMIT >= 0 &&
          config.settings.linkHistory.LINK_HISTORY_LIMIT <= 10
            ? config.settings.linkHistory.LINK_HISTORY_LIMIT
            : defaultConfig.settings.linkHistory.LINK_HISTORY_LIMIT,
      },
    },
  }
}

const getConfigData = async (url = `${import.meta.env.BASE_URL}config.json`) => {
  try {
    const configRes = await fetch(url)

    if (!configRes.ok) {
      throw new Error(`Failed to load config.json: ${configRes.status}`)
    }

    const configData = await configRes.json()

    return mergeConfigs(configData)
  } catch (error) {
    console.error('Returning default config, error fetching config:', error)
    return getDefaultConfig()
  }
}

const config = getDefaultConfig()
let configPromise = null

function loadConfig() {
  if (!configPromise) {
    configPromise = getConfigData().then((data) => {
      Object.assign(config, data)
      return config
    })
  }

  return configPromise
}

async function refreshConfig() {
  if (configPromise) await configPromise
  const data = await getConfigData()
  Object.assign(config, data)
  configPromise = Promise.resolve(config)
  return config
}

export { config, getConfigData, getDefaultConfig, mergeConfigs, loadConfig, refreshConfig }
