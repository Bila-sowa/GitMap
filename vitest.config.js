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
              "tests/utils/cipher.test.js",
              "tests/utils/linkHistory.test.js",
              "tests/data/storage.test.js",
              "tests/data/encryptionKeyStore.test.js",
              "tests/controllers/localStorage.test.js",
              "tests/controllers/link.test.js",
              "tests/controllers/theme.test.js",
              "tests/utils/escapeHTML.test.js",
              "tests/utils/sanitizeMarkdown.test.js",
              "tests/utils/notify.test.js",
              "tests/components/loader.test.js",
              "tests/components/settingsModal.test.js",
              "tests/api/gitHubClient/gitHubHttpApi/getHttpErrorMessage.test.js",
              "tests/api/gitHubClient/gitHubHttpApi/createHttpError.test.js",
              "tests/api/gitHubClient/requestControl/requestControl.test.js",
              "tests/api/gitHubClient/gitHubTransport/gitHubTransport.test.js",
              "tests/api/gitHubClient/gitHubClient/local/setToken.test.js",
              "tests/api/gitHubClient/gitHubClient/local/getRateLimitData.test.js",
              "tests/api/gitHubClient/gitHubClient/local/getCommitFiles.test.js",
              "tests/api/gitHubClient/gitHubClient/local/getDataByBranch.test.js",
              "tests/api/gitHubClient/gitHubClient/local/getData.test.js",
              "tests/api/gitHubClient/gitHubDataParser/parseBranchesData.test.js",
              "tests/api/gitHubClient/gitHubDataParser/parseCommitsData.test.js",
              "tests/api/gitHubClient/gitHubDataParser/parseRepoData.test.js",
              "tests/api/gitHubClient/gitHubDataParser/parseCommitFilesData.test.js",
            ],
            setupFiles: ["./tests/vitest/setupLocal.js"],
          },
        },
        {
          test: {
            name: "e2e",
            environment: "node",
            include: [
              "tests/api/gitHubClient/gitHubClient/e2e/getRateLimitData.e2e.test.js",
              "tests/api/gitHubClient/gitHubClient/e2e/getCommitFiles.e2e.test.js",
              "tests/api/gitHubClient/gitHubClient/e2e/getDataByBranch.e2e.test.js",
              "tests/api/gitHubClient/gitHubClient/e2e/getData.e2e.test.js",
            ],
          },
        },
      ],
    },
  }),
);
