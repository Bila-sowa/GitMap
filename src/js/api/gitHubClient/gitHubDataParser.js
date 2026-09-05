import formatter from "@/js/utils/formatter";
import { escapeHTML } from "@/js/utils/utils";

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
            const message = commit.message || commit.commit?.message || "";
            const sha = commit.oid || commit.sha || "";
            const authorDate = commit.author?.date || commit.commit?.author?.date;
            const authorName = commit.author?.name || commit.commit?.author?.name || "";
            const authorEmail = commit.author?.email || commit.commit?.author?.email || "";
            const avatarUrl = commit.author?.avatarUrl || commit.author?.avatar_url;
            const userUrl = commit.author?.user?.url || commit.author?.html_url;
            const commitUrl = commit.url || commit.html_url;

            const formattedTitle = formatter.getFormattedTitle(message);
            const formattedDescription = formatter.getFormattedDescription(message);
            const formattedDate = formatter.getDateInLocaleString(authorDate);
            const shortHash = formatter.getShortHash(sha);

            const details = {
                author: {
                    name: escapeHTML(authorName),
                    email: escapeHTML(authorEmail),
                    avatar: avatarUrl,
                    url: userUrl,
                    date: formattedDate,
                },
                title: escapeHTML(formattedTitle),
                description: formattedDescription ? escapeHTML(formattedDescription) : "",
                hash: shortHash,
                url: commitUrl,
                sha: sha,
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

export default GitHubDataParser;
