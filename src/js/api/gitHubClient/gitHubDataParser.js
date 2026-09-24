import formatter from "@/js/utils/formatter";
import { escapeHTML, isNonEmptyString, isRecord, isValidDate } from "@/js/utils/utils";

class GitHubDataParser {
    #createInvalidDataResult(method, rawResponse) {
        return {
            success: false,
            error: "Unexpected response format from GitHub",
            devError: {
                message: `Invalid response data in ${method}`,
                rawResponse,
            },
        };
    }

    parseBranchesData(branches) {
        if (!Array.isArray(branches) || !branches.length) {
            return this.#createInvalidDataResult("parseBranchesData", branches);
        }

        const branchesDetails = [];

        for (const branch of branches) {
            if (!isRecord(branch) || !isNonEmptyString(branch.name)) {
                return this.#createInvalidDataResult("parseBranchesData", branch);
            }

            branchesDetails.push(branch.name);
        }

        return { success: true, branchesDetails };
    }

    parseCommitsData(commits) {
        if (!Array.isArray(commits) || !commits.length) {
            return this.#createInvalidDataResult("parseCommitsData", commits);
        }

        const commitsDetails = [];

        for (const commit of commits) {
            const commitData = commit?.commit;
            const author = commitData?.author;

            if (
                !isRecord(commit) ||
                !isNonEmptyString(commit.sha) ||
                !isRecord(commitData) ||
                !isNonEmptyString(commitData.message) ||
                !isRecord(author) ||
                !isNonEmptyString(author.name) ||
                !isNonEmptyString(author.email) ||
                !isValidDate(author.date) ||
                (commit.author !== null && commit.author !== undefined && !isRecord(commit.author))
            ) {
                return this.#createInvalidDataResult("parseCommitsData", commit);
            }

            const formattedTitle = formatter.getFormattedTitle(commitData.message);
            const formattedDescription = formatter.getFormattedDescription(commitData.message);
            const formattedDate = formatter.getDateInLocaleString(author.date);
            const shortHash = formatter.getShortHash(commit.sha);

            const details = {
                author: {
                    name: escapeHTML(author.name),
                    email: escapeHTML(author.email),
                    avatar: typeof commit.author?.avatar_url === "string" ? commit.author.avatar_url : "",
                    url: typeof commit.author?.html_url === "string" ? commit.author.html_url : "",
                    date: formattedDate,
                },
                title: escapeHTML(formattedTitle),
                description: formattedDescription ? escapeHTML(formattedDescription) : "",
                hash: shortHash,
                url: typeof commit.html_url === "string" ? commit.html_url : "",
                sha: commit.sha,
                parents: Array.isArray(commit.parents)
                    ? commit.parents.map((parent) => parent?.sha).filter((sha) => typeof sha === "string" && sha)
                    : [],
            };

            commitsDetails.push(details);
        }

        return { success: true, commitsDetails };
    }

    parseRepoData(raw) {
        if (!isRecord(raw)) return this.#createInvalidDataResult("parseRepoData", raw);

        const branchesResult = this.parseBranchesData(raw.branches);

        if (!branchesResult.success) return branchesResult;

        const commitsResult = this.parseCommitsData(raw.commits);

        if (!commitsResult.success) return commitsResult;

        const branchesDetails = [...branchesResult.branchesDetails];
        const hasDefaultBranch = typeof raw.defaultBranch === "string" && raw.defaultBranch.trim();
        const defaultBranch = hasDefaultBranch ? raw.defaultBranch.trim() : branchesDetails[0];

        if (defaultBranch && !branchesDetails.includes(defaultBranch)) {
            branchesDetails.unshift(defaultBranch);
        }

        return {
            success: true,
            defaultBranch,
            commitsDetails: commitsResult.commitsDetails,
            branchesDetails,
        };
    }

    parseCommitFilesData(raw) {
        if (!isRecord(raw) || !Array.isArray(raw.files)) {
            return this.#createInvalidDataResult("parseCommitFilesData", raw);
        }

        const { files } = raw;
        const formattedData = [];

        for (const file of files) {
            if (
                !isRecord(file) ||
                !isNonEmptyString(file.filename) ||
                !isNonEmptyString(file.status) ||
                !Number.isFinite(file.additions) ||
                !Number.isFinite(file.deletions)
            ) {
                return this.#createInvalidDataResult("parseCommitFilesData", file);
            }

            const extension = formatter.getFormattedExtension(file.filename);
            const status = formatter.getShortStatus(file.status);

            const fileData = {
                name: escapeHTML(file.filename),
                additions: file.additions,
                deletions: file.deletions,
                extension: escapeHTML(extension),
                fullStatus: file.status,
                status: status,
            };

            formattedData.push(fileData);
        }

        return {
            success: true,
            files: formattedData,
            truncated: files.length >= 300,
        };
    }
}

export default GitHubDataParser;
