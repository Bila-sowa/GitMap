class Formatter {
  getCleanRepoUrl(repoUrl) {
    if (!repoUrl || typeof repoUrl !== "string") return "";
    return repoUrl.replace(/\.git\/?$/, "").replace(/\/$/, "");
  }

  getFormattedTitle(commitName) {
    if (!commitName || typeof commitName !== "string") return "";
    return commitName.split("\n").slice(0, 1).join("\n");
  }

  getFormattedDescription(commitName) {
    if (!commitName || typeof commitName !== "string") return "";
    const parts = commitName.split("\n");
    if (parts.length <= 1) return "";
    return parts.slice(1).join("\n");
  }

  getDateInLocaleString(date, locales, options) {
    if (!date) return "Invalid Date";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date";
    return parsedDate.toLocaleString(locales, options);
  }

  getFormattedDate(date, locales, options) {
    if (!date) return "Invalid Date";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date";
    return new Intl.DateTimeFormat(locales, options).format(parsedDate);
  }

  getShortHash(hash) {
    if (!hash || typeof hash !== "string") return "";
    return hash.slice(0, 7);
  }

  getFormattedExtension(fileName) {
    if (typeof fileName !== "string" || !fileName) return "file";

    const baseName = fileName.split(/[\\/]/).pop().toLowerCase();
    const extensionSeparator = baseName.lastIndexOf(".");

    if (extensionSeparator <= 0 || extensionSeparator === baseName.length - 1) return "file";

    return baseName.slice(extensionSeparator + 1).toLowerCase();
  }

  getShortStatus(fileStatus) {
    if (!fileStatus || typeof fileStatus !== "string") return "";
    return fileStatus.slice(0, 1).toUpperCase();
  }
}

const formatter = new Formatter();

export { Formatter };
export default formatter;
