import notifications from "@/js/utils/notificationManager";

/**
 * #### Description:
 * 
 * The test sequentially outputs the specified number of messages.
 * 
 * #### Params:
 * - file: notificationManager.js
 * - test: test_44ibx_Ui
 * - name: notify
 * - type: method
 * 
 */
export default async function test_44ibx_Ui() {
    const types = ["info", "success", "warning", "error"];

    for (const type of types) {
        notifications.notify("Test notification", type);
    }
}
