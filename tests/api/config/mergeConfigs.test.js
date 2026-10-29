import { describe, test, expect } from "vitest";
import { getDefaultConfig, mergeConfigs } from "@/js/api/config";

describe("mergeConfigs", () => {
  test("preserves valid partial values and fills missing fields with defaults", () => {
    const defaultConfig = getDefaultConfig();
    const result = mergeConfigs({
      name: "Custom GitMap",
      graph: { renderLimit: 50 },
    });

    expect(result).toStrictEqual({
      ...defaultConfig,
      name: "Custom GitMap",
      graph: { renderLimit: 50 },
    });
  });

  test("replaces malformed values with defaults while preserving a valid version type", () => {
    const defaultConfig = getDefaultConfig();
    const result = mergeConfigs({
      name: "",
      debug: "true",
      versionDetails: {
        version: 3,
        versionType: "beta",
        versionIsStable: "false",
      },
      graph: { renderLimit: -1.5 },
      notifications: {
        showNotifications: "yes",
        COOLDOWN_MS: Number.POSITIVE_INFINITY,
      },
      gitHub: { REQUEST_TIMEOUT_MS: 0 },
      loader: {
        showLoader: 1,
        CLEANUP_TIMEOUT_MS: -1,
      },
    });

    expect(result).toStrictEqual({
      ...defaultConfig,
      versionDetails: {
        ...defaultConfig.versionDetails,
        versionType: "beta",
      },
    });
  });

  test("returns the full default config for null", () => {
    const defaultConfig = getDefaultConfig();
    const result = mergeConfigs(null);

    expect(result).toStrictEqual(defaultConfig);
  });
});
