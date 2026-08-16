import GitHubClient from "@/js/services/getGitHubData";
import * as tools from "../tools/testTools";

export default async function test_2rb1v_Data() {
    const config = new tools.TestConfig(
        {
            file: "getGitHubData.js",
            test: "test_2rb1v_Data",
            name: "getAuthenticatedStatus",
            type: "method",
        },
    );

    const client = new GitHubClient;
    const data = await client.getAuthenticatedStatus();

    return new tools.TestFeedBack({
        ...config.details,
        success: true,
        data: data,
    });
}
