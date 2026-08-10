const copyValueToClipboard = async (element) => {
    const value = element.dataset.copyValue;
    if (!value) return;

    try {
        await navigator.clipboard.writeText(value);
        element.classList.add("copied");
        setTimeout(() => element.classList.remove("copied"), COOLDOWN);
    } catch (err) {
        console.log(err);
    }
};

export {
    copyValueToClipboard,
}
