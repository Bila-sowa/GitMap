import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          test: {
            name: "local",
            environment: "node",
            include: [
              "tests/api/config/mergeConfigs.test.js",
              "tests/utils/commitGraph.test.js",
              "tests/utils/formatter.test.js",
              "tests/data/storage.test.js",
            ],
            setupFiles: ["./tests/vitest/setupLocal.js"],
          },
        },
        {
          test: {
            name: "e2e",
            environment: "node",
            include: [],
          },
        },
      ],
    },
  }),
);
