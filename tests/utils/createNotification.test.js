import { createNotification } from '@/js/utils/utils.js';

const sleap = (ms = 5000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * #### Description:
 * 
 * The test sequentially outputs the specified number of messages.
 * 
 * #### Params:
 * - file: utils.js
 * - test: test_44ibx_Ui
 * - name: createNotification
 * - type: function
 * 
 */
export default async function test_44ibx_Ui() {
    const types = ["info", "success", "warning", "error"];

    for (const type of types) {
        createNotification("Test notification", type);
        await sleap();
    }
}
