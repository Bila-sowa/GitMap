import { describe, test, expect } from 'vitest'
import { getDefaultConfig, mergeConfigs } from '@/js/api/config'

describe('mergeConfigs', () => {
  const defaultConfig = getDefaultConfig()

  test('preserves valid partial values and fills missing fields with defaults', () => {
    const result = mergeConfigs({
      name: 'Custom GitMap',
      settings: {
        graph: { renderLimit: 50 },
        linkHistory: { HIDE_DELAY_MS: 2500, LINK_HISTORY_LIMIT: 4 },
      },
    })

    expect(result).toStrictEqual({
      ...defaultConfig,
      name: 'Custom GitMap',
      settings: {
        ...defaultConfig.settings,
        graph: { renderLimit: 50 },
        linkHistory: { HIDE_DELAY_MS: 2500, LINK_HISTORY_LIMIT: 4 },
      },
    })
  })

  test('replaces malformed values with defaults while preserving a valid version type', () => {
    const result = mergeConfigs({
      name: '',
      debug: 'true',
      versionDetails: {
        version: 3,
        versionType: 'beta',
        versionIsStable: 'false',
      },
      settings: {
        graph: { renderLimit: -1.5 },
        notifications: {
          showNotifications: 'yes',
          COOLDOWN_MS: Number.POSITIVE_INFINITY,
        },
        gitHub: { REQUEST_TIMEOUT_MS: 0 },
        loader: {
          showLoader: 1,
          CLEANUP_TIMEOUT_MS: -1,
        },
        linkHistory: {
          HIDE_DELAY_MS: -1,
          LINK_HISTORY_LIMIT: 0.3,
        },
      },
    })

    expect(result).toStrictEqual({
      ...defaultConfig,
      versionDetails: {
        ...defaultConfig.versionDetails,
        versionType: 'beta',
      },
    })
  })

  test('returns the full default config for null', () => {
    const result = mergeConfigs(null)

    expect(result).toStrictEqual(defaultConfig)
  })
})
