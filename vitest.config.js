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
                        include: [],
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
