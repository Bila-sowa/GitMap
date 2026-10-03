function getRandomID(prefix) {
    return `${prefix ? prefix + "-" : ""}${Math.random().toString(16).slice(2)}`;
}

export default getRandomID;
