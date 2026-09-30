import GitHubDataParser from "@/js/api/gitHubClient/gitHubDataParser";
import { TestConfig } from "../../tools/testTools";

export default function test_n7rjx_Data() {
    const responseFormatError = "Unexpected response format from GitHub";
    const getResultSummary = (result) => ({
        success: result.success,
        error: result.error,
        message: result.devError?.message,
    });
    const config = new TestConfig(
        {
            file: "gitHubDataParser.js",
            test: "test_n7rjx_Data",
            name: "invalid parser input",
            type: "method",
        },
        {
            nullCommitAuthor: {
                success: false,
                error: responseFormatError,
                message: "Invalid response data in parseCommitsData",
            },
            missingMessage: {
                success: false,
                error: responseFormatError,
                message: "Invalid response data in parseCommitsData",
            },
            missingSha: {
                success: false,
                error: responseFormatError,
                message: "Invalid response data in parseCommitsData",
            },
            missingFiles: {
                success: false,
                error: responseFormatError,
                message: "Invalid response data in parseCommitFilesData",
            },
            missingFilename: {
                success: false,
                error: responseFormatError,
                message: "Invalid response data in parseCommitFilesData",
            },
            emptyFiles: {
                success: true,
                files: [],
                truncated: false,
            },
        },
    );

    return config.run(() => {
        const parser = new GitHubDataParser();
        const validCommit = {
            sha: "abc123",
            commit: {
                message: "Test commit",
                author: {
                    name: "Test User",
                    email: "test@example.com",
                    date: "2026-01-01T00:00:00Z",
                },
            },
        };
        const nullCommitAuthor = parser.parseRepoData({
            branches: [{ name: "main" }],
            commits: [
                {
                    ...validCommit,
                    commit: {
                        ...validCommit.commit,
                        author: null,
                    },
                },
            ],
        });
        const missingMessage = parser.parseCommitsData([
            {
                ...validCommit,
                commit: {
                    ...validCommit.commit,
                    message: undefined,
                },
            },
        ]);
        const missingSha = parser.parseCommitsData([{ ...validCommit, sha: "" }]);
        const missingFiles = parser.parseCommitFilesData({ message: "invalid" });
        const missingFilename = parser.parseCommitFilesData({
            files: [{ status: "modified", additions: 1, deletions: 0 }],
        });
        const emptyFiles = parser.parseCommitFilesData({ files: [] });

        return {
            nullCommitAuthor: getResultSummary(nullCommitAuthor),
            missingMessage: getResultSummary(missingMessage),
            missingSha: getResultSummary(missingSha),
            missingFiles: getResultSummary(missingFiles),
            missingFilename: getResultSummary(missingFilename),
            emptyFiles,
        };
    });
}
