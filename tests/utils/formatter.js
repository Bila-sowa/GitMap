import Formatter from "@/js/utils/formatter";
import * as tools from "../tools/testTools";

export default function test_gj781_Data() {
    const config = new tools.TestConfig(
        { // details
            file: "formatter.js",
            test: "test_gj781_Data",
            name: "Formatter",
            type: "class",
        },

        { // expected
            title: "update tests",
            description: "\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
            dateInLocalString: "16.08.2026, 15:55:32",
            shortHash: "35c2ab6",
            formatedExtension: "js",
            shorStatus: "M"
        },

        { // test data
            name: "update tests\n\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
            date: "2026-08-16T12:55:32Z",
            hash: "35c2ab6d6ac3526a22a21d0a83c6309f574daeac",
            extension: "example.js",
            status: "modifed",
        }
    );

    const formatter = new Formatter();

    const formattedData = {
        title: formatter.getFormattedTitle(config.testData.name),
        description: formatter.getFormattedDescription(config.testData.name),
        dateInLocalString: formatter.getDateInLocaleString(config.testData.date),
        shortHash: formatter.getShortHash(config.testData.hash),
        formatedExtension: formatter.getFormattedExtension(config.testData.extension),
        shorStatus: formatter.getShortStatus(config.testData.status),
    }

    const result = tools.validateTestData(formattedData, config.expected);

    return new tools.TestFeedBack({
        ...config.details,
        success: result,
        data: formattedData,
    });
}
