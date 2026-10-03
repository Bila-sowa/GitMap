function getDomElements(root = document) {
    return {
        body: root.querySelector("body"),
        viewport: root.querySelector("#viewport"),
        canvas: root.querySelector("#canvas"),
        linkInput: root.querySelector("#linkInput"),
        refreshButton: root.querySelector("#refresh"),
        themeButton: root.querySelector("#theme"),
        settingsButton: root.querySelector("#settings"),
        graph: root.querySelector("#graph"),
        scaleIncreaseButton: root.querySelector("#scale-increase"),
        scaleDisplay: root.querySelector("#scale-display"),
        scaleDecreaseButton: root.querySelector("#scale-decrese"),
        dropDownTrigger: root.querySelector("#branch-dropdown-trigger"),
        dropDownList: root.querySelector("#branch-dropdown-list"),
        dropDownLabel: root.querySelector("#branch-dropdown-label"),
    };
}

export { getDomElements };
