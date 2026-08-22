/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard-scss"],
    rules: {
        "declaration-block-no-duplicate-custom-properties": true,
        "declaration-block-no-duplicate-properties": true,
        "declaration-property-value-keyword-no-deprecated": null,
        "keyframe-block-no-duplicate-selectors": true,
        "no-duplicate-at-import-rules": true,
        "no-duplicate-selectors": true,
        "block-no-empty": true,
        "comment-no-empty": true,
        "color-no-invalid-hex": true,
        "function-calc-no-unspaced-operator": true,
        "no-invalid-position-declaration": true,
        "alpha-value-notation": "percentage",
    }
};
