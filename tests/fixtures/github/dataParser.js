const DEFAULT_COMMIT_SHA = "51c497d0faee027f4b124401823c59416bda590a";
const DEFAULT_AUTHOR = {
  name: "Test User",
  email: "test@example.com",
  date: "2026-08-28T12:58:44Z",
};
const DEFAULT_GITHUB_AUTHOR = {
  avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
  html_url: "https://github.com/test-user",
};

const createBranch = (name) => ({ name });

const createCommit = ({
  sha = DEFAULT_COMMIT_SHA,
  message = "Fix login flow\n\nHandle expired sessions.",
  author = DEFAULT_AUTHOR,
  githubAuthor = DEFAULT_GITHUB_AUTHOR,
  parents = [{ sha: "282fa46d7bdd39f183a8aa924211106fa250f9a3" }],
  htmlUrl = `https://github.com/example/project/commit/${DEFAULT_COMMIT_SHA}`,
} = {}) => ({
  sha,
  html_url: htmlUrl,
  commit: { message, author },
  author: githubAuthor,
  parents,
});

const createFile = ({ filename = "README.md", status = "modified", additions = 3, deletions = 1 } = {}) => ({
  filename,
  status,
  additions,
  deletions,
});

export { createBranch, createCommit, createFile };
