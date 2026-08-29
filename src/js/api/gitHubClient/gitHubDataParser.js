import formatter from "../../utils/formatter.js";
import { escapeHTML } from "../../utils/utils.js";

class GitHubDataParser {
    parseRepoData(raw) {
        const branches = Array.isArray(raw.branches) ? raw.branches : [];
        const commits = Array.isArray(raw.commits) ? raw.commits : [];

        if (!branches.length || !commits.length) {
            return {
                success: false,
                error: "Unexpected response format from GitHub",
                devError: {
                    message: `Missing data in parseRepoData: branches count = ${branches.length}, commits count = ${commits.length}`,
                    branches,
                    commits,
                },
            };
        }

        const commitsDetails = [];
        const branchesDetails = [];

        commits.forEach((commit) => {
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

        branches.forEach((branch) => {
            const details = { name: escapeHTML(branch.name) };
            branchesDetails.push(details);
        });

        return { success: true, commitsDetails, branchesDetails };
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

const gitHubDataParser = new GitHubDataParser();

export { GitHubDataParser };
export default gitHubDataParser;
