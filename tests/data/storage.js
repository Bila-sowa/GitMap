import { Storage } from "@/js/data/storage";
import { TestConfig } from "../tools/testTools";

/**
 * #### Description:
 * 
 * The test checks the functionality of `storage.js` with various patterns of valid and invalid data, and returns the storage at the end.
 * 
 * #### Params:
 * - file: `storage.js`
 * - test: `test_8je0j_Data`
 * - name: `Storage`
 * - type: `class`
 * 
 * @returns TestFeedback
 */
export default function test_8je0j_Data() {
    const storageInstance = new Storage();
    const config = new TestConfig(
        {
            file: "storage.js",
            test: "test_8je0j_Data",
            name: "Storage",
            type: "class",
        },
        {
            link: "https://github.com/Bila-sowa/GitMap",
            theme: "dark-theme",
            token: "",
            localStorage: {
                saveLink: false,
                saveToken: false,
            },
        },
        {
            link: "   https://github.com/Bila-sowa/GitMap    ",
            theme: "contrast-theme",
            token: false,
            localStorage: {
                saveLink: "Yes",
                saveToken: 3,
            },
        },
    );

    return config.run(({ link, theme, token, localStorage }) => {
        storageInstance.setLink(link);
        storageInstance.theme = theme;
        storageInstance.token = token;
        storageInstance.setData({ localStorage });

        return storageInstance.getData();
    });
}
