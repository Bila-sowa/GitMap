export default class Formatter {

    getFormattedTitle(title) {
        return title.split('\n').slice(0, 1).join('\n');
    }

    getFormattedDescription(description) {
        return description.split('\n').slice(1).join('\n');
    }

    getFormattedDate(date) {
        return new Date(date).toLocaleString();
    }

    getFormattedHash(hash) {
        return hash.slice(0, 7);
    }

}
