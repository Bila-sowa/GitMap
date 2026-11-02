import {
  isBoolean,
  isIntegerInRange,
  isNonEmptyString,
  isNumberInRange,
  isPlainObject,
  isPositiveInteger,
} from '@/js/utils/matchers'

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

const resolveConfigValue = (value, isValid, fallback) => {
  return isValid(value) ? value : fallback
}

const mergeConfigs = (invalidConfig) => {
  const defaultConfig = getDefaultConfig()
  const config = isPlainObject(invalidConfig) ? invalidConfig : {}

  return {
    name: resolveConfigValue(config.name, isNonEmptyString, defaultConfig.name),
    debug: resolveConfigValue(config.debug, isBoolean, defaultConfig.debug),
    versionDetails: {
      version: resolveConfigValue(
        config.versionDetails?.version,
        isNonEmptyString,
        defaultConfig.versionDetails.version,
      ),
      versionType: resolveConfigValue(
        config.versionDetails?.versionType,
        isNonEmptyString,
        defaultConfig.versionDetails.versionType,
      ),
      versionIsStable: resolveConfigValue(
        config.versionDetails?.versionIsStable,
        isBoolean,
        defaultConfig.versionDetails.versionIsStable,
      ),
    },

    settings: {
      graph: {
        renderLimit: resolveConfigValue(
          config.settings?.graph?.renderLimit,
          isPositiveInteger,
          defaultConfig.settings.graph.renderLimit,
        ),
      },
      gitHub: {
        REQUEST_TIMEOUT_MS: resolveConfigValue(
          config.settings?.gitHub?.REQUEST_TIMEOUT_MS,
          (value) => isIntegerInRange(value, 1000, 120000),
          defaultConfig.settings.gitHub.REQUEST_TIMEOUT_MS,
        ),
      },
      notifications: {
        showNotifications: resolveConfigValue(
          config.settings?.notifications?.showNotifications,
          isBoolean,
          defaultConfig.settings.notifications.showNotifications,
        ),
        COOLDOWN_MS: resolveConfigValue(
          config.settings?.notifications?.COOLDOWN_MS,
          (value) => isNumberInRange(value, 0, 60000),
          defaultConfig.settings.notifications.COOLDOWN_MS,
        ),
      },
      loader: {
        showLoader: resolveConfigValue(
          config.settings?.loader?.showLoader,
          isBoolean,
          defaultConfig.settings.loader.showLoader,
        ),
        CLEANUP_TIMEOUT_MS: resolveConfigValue(
          config.settings?.loader?.CLEANUP_TIMEOUT_MS,
          (value) => isIntegerInRange(value, 1000, 120000),
          defaultConfig.settings.loader.CLEANUP_TIMEOUT_MS,
        ),
      },
      linkHistory: {
        HIDE_DELAY_MS: resolveConfigValue(
          config.settings?.linkHistory?.HIDE_DELAY_MS,
          (value) => isIntegerInRange(value, 0, 60000),
          defaultConfig.settings.linkHistory.HIDE_DELAY_MS,
        ),
        LINK_HISTORY_LIMIT: resolveConfigValue(
          config.settings?.linkHistory?.LINK_HISTORY_LIMIT,
          (value) => isIntegerInRange(value, 0, 10),
          defaultConfig.settings.linkHistory.LINK_HISTORY_LIMIT,
        ),
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
