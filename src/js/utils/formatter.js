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

    getFormattedExtension(file) {
        return file?.filename.slice(file.filename.lastIndexOf(".") + 1);
    }

    getShortStatus(file) {
        return file.status.slice(0, 1).toUpperCase();
    }
}
