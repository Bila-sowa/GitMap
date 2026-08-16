export default class Formatter {

    getFormattedTitle(commitName) {
        return commitName.split('\n').slice(0, 1).join('\n');
    }

    getFormattedDescription(commitName) {
        return commitName.split('\n').slice(1).join('\n');
    }

    getDateInLocaleString(date) {
        return new Date(date).toLocaleString();
    }

    getShortHash(hash) {
        return hash.slice(0, 7);
    }

    getFormattedExtension(fileName) {
        return fileName.slice(fileName.lastIndexOf(".") + 1);
    }

    getShortStatus(fileStatus) {
        return fileStatus.slice(0, 1).toUpperCase();
    }
}
