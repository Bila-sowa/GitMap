import { GitHubDataParser } from "@/js/api/gitHubClient/gitHubDataParser";
import { ANY_VALID, TestConfig } from "../../tools/testTools";

/**
 * #### Description:
 *
 * The test parses raw data from the GitHub REST API about branches and commits into more convenient and understandable data, extracting only what is needed.
 *
 * #### Params:
 * - file: `gitHubDataParser`
 * - test: `test_idi3p_Data`
 * - name: `parseRepoData`
 * - type: `method`
 *
 * @returns TestFeedback
 */
export default function test_idi3p_Data() {
    const config = new TestConfig(
        {
            file: "gitHubDataParser",
            test: "test_idi3p_Data",
            name: "parseRepoData",
            type: "method",
        },
        {
            branchesDetails: ANY_VALID,
            commitsDetails: ANY_VALID,
            success: true,
        },
        {
            branches: [
                {
                    name: "gh-pages",
                    commit: {
                        sha: "1cbed9ccd45d045ade461da424696b46322a7f56",
                        url: "https://api.github.com/repos/Bila-sowa/GitMap/commits/1cbed9ccd45d045ade461da424696b46322a7f56",
                    },
                    protected: false,
                },
            ],
            commits: [
                {
                    sha: "51c497d0faee027f4b124401823c59416bda590a",
                    node_id: "C_kwDOTj3rDdoAKDUxYzQ5N2QwZmFlZTAyN2Y0YjEyNDQwMTgyM2M1OTQxNmJkYTU5MGE",
                    commit: {
                        author: {
                            name: "Bila_sowa",
                            email: "zlepkopavlo9@gmail.com",
                            date: "2026-08-28T12:58:44Z",
                        },
                        committer: {
                            name: "GitHub",
                            email: "noreply@github.com",
                            date: "2026-08-28T12:58:44Z",
                        },
                        message:
                            "Merge pull request #12 from Bila-sowa/feature-scaleMenu\n\nadded: scale widget functional",
                        tree: {
                            sha: "e4c4944c9eaab36437ae070643baa06211cb90b2",
                            url: "https://api.github.com/repos/Bila-sowa/GitMap/git/trees/e4c4944c9eaab36437ae070643baa06211cb90b2",
                        },
                        url: "https://api.github.com/repos/Bila-sowa/GitMap/git/commits/51c497d0faee027f4b124401823c59416bda590a",
                        comment_count: 0,
                        verification: {
                            verified: true,
                            reason: "valid",
                            signature:
                                "-----BEGIN PGP SIGNATURE-----\n\nwsFcBAABCAAQBQJqkYYECRC1aQ7uu5UhlAAAMMAQAC6xGVEpFO4dCdbEnXrgtePk\nnhh2CNM1r/eqeeuGKeC6HdV5LEyFjfCfUaJK1avTg6amiZ6fa0phnYl+aAkc8Bdf\n3uVL9b/uwP0Do1vX3YZGAN51JWCyME7UuTSb74AQ/DF2juEkNL6QVcGoB2p7+Y2b\nD6RPtuYT9BvJ2OvydU1hLs6d6FFLMfp6zeIpaGwvlZe58L2yy6xxG8ZZz5QLp+q7\nQWJrG6ZR2AyWt/gg/E7DBMt2nlyKmXVt30d3HYODCOpfaaGVZXBpRWolKS2Dv7u+\nztPn7F2Hy9qLVKGtzn3UE0dUQyQZhc1LPBc/A+N6laaPN5yTNCa0GQjURsYfqNIZ\nKOBARAdgLDcbb6jxi5olSCx1rbNqRqDfBNAnIetgLGKku9qPGIGEOEC6aeXTo6I/\nzVv/0ZNHwuwPpyHUYeKW5qUJvfObpOc4hs6w+6k1EO7WTQQB+Kf1fkv0i58BWKix\nXD5EREuuIatWDSrM4bOh8pg2wkJnQopSB+CHG6kyB/AdDgKjtHR6etniOZwwCdYV\nkzZcr82Ste7FjRMir5MT9EORTmdyB3UqWnVHOH/WiyqI7CM93Le4iPS9FNDRz4Ro\nFPyp1LRq+DZq28hwKWAuvSTB6R2SC7AJp6GOCsfC+Nk4ywv8t67qWaqdhrwuzsIe\nWjbikrZVU4eifwaD58Gw\n=kjot\n-----END PGP SIGNATURE-----\n",
                            payload:
                                "tree e4c4944c9eaab36437ae070643baa06211cb90b2\nparent 282fa46d7bdd39f183a8aa924211106fa250f9a3\nparent 71a4288ba55eea653e8ac0fa8365e90603204575\nauthor Bila_sowa <zlepkopavlo9@gmail.com> 1787921924 +0300\ncommitter GitHub <noreply@github.com> 1787921924 +0300\n\nMerge pull request #12 from Bila-sowa/feature-scaleMenu\n\nadded: scale widget functional",
                            verified_at: "2026-08-28T12:58:45Z",
                        },
                    },
                    url: "https://api.github.com/repos/Bila-sowa/GitMap/commits/51c497d0faee027f4b124401823c59416bda590a",
                    html_url: "https://github.com/Bila-sowa/GitMap/commit/51c497d0faee027f4b124401823c59416bda590a",
                    comments_url:
                        "https://api.github.com/repos/Bila-sowa/GitMap/commits/51c497d0faee027f4b124401823c59416bda590a/comments",
                    author: {
                        login: "Bila-sowa",
                        id: 274431135,
                        node_id: "U_kgDOEFt8nw",
                        avatar_url: "https://avatars.githubusercontent.com/u/274431135?v=4",
                        gravatar_id: "",
                        url: "https://api.github.com/users/Bila-sowa",
                        html_url: "https://github.com/Bila-sowa",
                        followers_url: "https://api.github.com/users/Bila-sowa/followers",
                        following_url: "https://api.github.com/users/Bila-sowa/following{/other_user}",
                        gists_url: "https://api.github.com/users/Bila-sowa/gists{/gist_id}",
                        starred_url: "https://api.github.com/users/Bila-sowa/starred{/owner}{/repo}",
                        subscriptions_url: "https://api.github.com/users/Bila-sowa/subscriptions",
                        organizations_url: "https://api.github.com/users/Bila-sowa/orgs",
                        repos_url: "https://api.github.com/users/Bila-sowa/repos",
                        events_url: "https://api.github.com/users/Bila-sowa/events{/privacy}",
                        received_events_url: "https://api.github.com/users/Bila-sowa/received_events",
                        type: "User",
                        user_view_type: "public",
                        site_admin: false,
                    },
                    committer: {
                        login: "web-flow",
                        id: 19864447,
                        node_id: "MDQ6VXNlcjE5ODY0NDQ3",
                        avatar_url: "https://avatars.githubusercontent.com/u/19864447?v=4",
                        gravatar_id: "",
                        url: "https://api.github.com/users/web-flow",
                        html_url: "https://github.com/web-flow",
                        followers_url: "https://api.github.com/users/web-flow/followers",
                        following_url: "https://api.github.com/users/web-flow/following{/other_user}",
                        gists_url: "https://api.github.com/users/web-flow/gists{/gist_id}",
                        starred_url: "https://api.github.com/users/web-flow/starred{/owner}{/repo}",
                        subscriptions_url: "https://api.github.com/users/web-flow/subscriptions",
                        organizations_url: "https://api.github.com/users/web-flow/orgs",
                        repos_url: "https://api.github.com/users/web-flow/repos",
                        events_url: "https://api.github.com/users/web-flow/events{/privacy}",
                        received_events_url: "https://api.github.com/users/web-flow/received_events",
                        type: "User",
                        user_view_type: "public",
                        site_admin: false,
                    },
                    parents: [
                        {
                            sha: "282fa46d7bdd39f183a8aa924211106fa250f9a3",
                            url: "https://api.github.com/repos/Bila-sowa/GitMap/commits/282fa46d7bdd39f183a8aa924211106fa250f9a3",
                            html_url:
                                "https://github.com/Bila-sowa/GitMap/commit/282fa46d7bdd39f183a8aa924211106fa250f9a3",
                        },
                        {
                            sha: "71a4288ba55eea653e8ac0fa8365e90603204575",
                            url: "https://api.github.com/repos/Bila-sowa/GitMap/commits/71a4288ba55eea653e8ac0fa8365e90603204575",
                            html_url:
                                "https://github.com/Bila-sowa/GitMap/commit/71a4288ba55eea653e8ac0fa8365e90603204575",
                        },
                    ],
                },
            ],
            success: true,
        },
    );

    const parser = new GitHubDataParser();

    return config.run((testData) => {
        return parser.parseRepoData(testData);
    });
}
