import { Formatter } from "@/js/utils/formatter";
import { TestConfig } from "../tools/testTools";

/**
 * #### Description:
 * 
 * The test checks the formatter's methods with different types of data.
 * 
 * #### Params:
 * - file: `formatter.js`
 * - test: `test_gj781_Data`
 * - name: `Formatter`
 * - type: `class`
 * 
 */
export default function test_gj781_Data() {
    const config = new TestConfig(
        {
            file: "formatter.js",
            test: "test_gj781_Data",
            name: "Formatter",
            type: "class",
        },
        {
            title: "update tests",
            description: "\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
            dateInLocalString: "16.08.2026, 15:55:32",
            shortHash: "35c2ab6",
            formatedExtension: "js",
            shorStatus: "M",
        },
        {
            name: "update tests\n\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
            date: "2026-08-16T12:55:32Z",
            hash: "35c2ab6d6ac3526a22a21d0a83c6309f574daeac",
            extension: "example.js",
            status: "modifed",
        },
    );

    const formatter = new Formatter();

    return config.run(({ name, date, hash, extension, status }) => {
        return {
            title: formatter.getFormattedTitle(name),
            description: formatter.getFormattedDescription(name),
            dateInLocalString: formatter.getDateInLocaleString(date),
            shortHash: formatter.getShortHash(hash),
            formatedExtension: formatter.getFormattedExtension(extension),
            shorStatus: formatter.getShortStatus(status),
        };
    });
}
