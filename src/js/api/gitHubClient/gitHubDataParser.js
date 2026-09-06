import formatter from "@/js/utils/formatter";
import { escapeHTML } from "@/js/utils/utils";

class GitHubDataParser {
    parseBranchesData(branches) {
        const branchesList = Array.isArray(branches) ? branches : [];

        if (!branchesList.length) {
            return {
                success: false,
                error: "Unexpected response format from GitHub",
                devError: {
                    message: `Missing data in parseBranchData: branches count = ${branchesList.length}`,
                    branches: branchesList,
                },
            };
        }

        const branchesDetails = [];

        branchesList.forEach((branch) => {
            const details = escapeHTML(branch.name);
            branchesDetails.push(details);
        });

        return { success: true, branchesDetails };
    }

    parseCommitsData(commits) {
        const commitsList = Array.isArray(commits) ? commits : [];

        if (!commitsList.length) {
            return {
                success: false,
                error: "Unexpected response format from GitHub",
                devError: {
                    message: `Missing data in parseCommitsData: commits count = ${commitsList.length}`,
                    commits: commitsList,
                },
            };
        }

        const commitsDetails = [];

        commitsList.forEach((commit) => {
            const formattedTitle = formatter.getFormattedTitle(commit.commit.message);
            const formattedDescription = formatter.getFormattedDescription(commit.commit.message);
            const formattedDate = formatter.getDateInLocaleString(commit.commit.author.date);
            const shortHash = formatter.getShortHash(commit.sha);

            const details = {
                author: {
                    name: escapeHTML(commit.commit.author.name),
                    email: escapeHTML(commit.commit.author.email),
                    avatar: commit.author?.avatar_url,
                    url: commit.author?.html_url,
                    date: formattedDate,
                },
                title: escapeHTML(formattedTitle),
                description: formattedDescription ? escapeHTML(formattedDescription) : "",
                hash: shortHash,
                url: commit.html_url,
                sha: commit.sha,
            };

            commitsDetails.push(details);
        });

        return { success: true, commitsDetails };
    }

    parseRepoData(raw) {
        const branchesResult = this.parseBranchesData(raw.branches);

        if (!branchesResult.success) return branchesResult;

        const commitsResult = this.parseCommitsData(raw.commits);

        if (!commitsResult.success) return commitsResult;

        return {
            success: true,
            commitsDetails: commitsResult.commitsDetails,
            branchesDetails: branchesResult.branchesDetails,
        };
    }

    parseCommitFilesData(raw) {
        const files = Array.isArray(raw.files) ? raw.files : [];
        const formattedData = [];

        files.forEach((file) => {
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
        });

        return {
            success: true,
            files: formattedData,
            truncated: files.length === 300,
        };
    }
}

export default GitHubDataParser;
