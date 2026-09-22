import RequestControl from "@/js/api/gitHubClient/requestControl";
import { TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * Verifies that GitHub request control propagates an external abort, creates
 * an independent timeout abort, and cancels its timer during cleanup.
 *
 * #### Params:
 * - file: `requestControl.js`
 * - test: `test_4lmw4_Data`
 * - name: `RequestControl`
 * - type: `class`
 *
 * @returns {Promise<TestFeedback>} Test feedback for cancellation, timeout, and cleanup behavior.
 */
export default function test_4lmw4_Data() {
    const config = new TestConfig(
        {
            file: "requestControl.js",
            test: "test_4lmw4_Data",
            name: "RequestControl",
            type: "class",
        },
        {
            externalAbortPropagated: true,
            externalAbortIsNotTimeout: true,
            timeoutAbortTriggered: true,
            timeoutStateRecorded: true,
            cleanupPreventsTimeout: true,
        },
    );

    return config.run(async () => {
        const externalController = new AbortController();
        const externalRequest = new RequestControl(externalController.signal, 1000);
        externalController.abort();

        const externalAbortPropagated = externalRequest.signal.aborted;
        const externalAbortIsNotTimeout = !externalRequest.didTimeout();
        externalRequest.cleanup();

        const timeoutRequest = new RequestControl(undefined, 10);
        await new Promise((resolve) => setTimeout(resolve, 20));
        const timeoutAbortTriggered = timeoutRequest.signal.aborted;
        const timeoutStateRecorded = timeoutRequest.didTimeout();
        timeoutRequest.cleanup();

        const completedRequest = new RequestControl(undefined, 10);
        completedRequest.cleanup();
        await new Promise((resolve) => setTimeout(resolve, 20));
        const cleanupPreventsTimeout = !completedRequest.signal.aborted;

        return {
            externalAbortPropagated,
            externalAbortIsNotTimeout,
            timeoutAbortTriggered,
            timeoutStateRecorded,
            cleanupPreventsTimeout,
        };
    });
}
