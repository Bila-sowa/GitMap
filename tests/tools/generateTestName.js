(function (prefix = "test_", totalLength = 10) {
    const randomLength = totalLength - prefix.length;
    let randomPart = "";

    while (randomPart.length < randomLength) {
        randomPart += Math.random().toString(36).slice(2);
    }

    console.log(prefix + randomPart.slice(0, randomLength));
})();
