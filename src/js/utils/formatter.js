class Formatter {
    getCleanRepoUrl(repoUrl) {
        return repoUrl?.replace(/\.git$/, "").replace(/\/$/, "");
    }

    getFormattedTitle(commitName) {
        return commitName?.split("\n").slice(0, 1).join("\n");
    }

    getFormattedDescription(commitName) {
        return commitName?.split("\n").slice(1).join("\n");
    }

    getDateInLocaleString(date, locales, options) {
        return new Date(date).toLocaleString(locales, options);
    }

    getFormattedDate(date, locales, options) {
        return new Intl.DateTimeFormat(locales, options).format(new Date(date));
    }

    getShortHash(hash) {
        return hash?.slice(0, 7);
    }

    getFormattedExtension(fileName) {
        if (typeof fileName !== "string" || !fileName) return "file";

        const baseName = fileName.split(/[\\/]/).pop().toLowerCase();
        const extensionSeparator = baseName.lastIndexOf(".");

        if (extensionSeparator <= 0 || extensionSeparator === baseName.length - 1) return "file";

        return baseName.slice(extensionSeparator + 1).toLowerCase();
    }

    getShortStatus(fileStatus) {
        return fileStatus?.slice(0, 1).toUpperCase();
    }
}

const formatter = new Formatter();

export { Formatter };
export default formatter;
