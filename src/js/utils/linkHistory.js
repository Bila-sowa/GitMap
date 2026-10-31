import parseGitHubUrl from "../api/gitHubClient/gitHubUrlParser.js";
import { config } from "../api/config.js";

function getLinkKey(link) {
  if (typeof link !== "string") return "";

  const trimmed = link.trim();

  if (!trimmed) return "";

  const parsed = parseGitHubUrl(trimmed);

  return parsed.success ? parsed.repositoryLink.toLowerCase() : trimmed.toLowerCase();
}

function addLinkToHistory(history, link) {
  const current = Array.isArray(history)
    ? history.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];
  const trimmed = typeof link === "string" ? link.trim() : "";

  if (!trimmed) return current.slice(0, config.linkHistory.LINK_HISTORY_LIMIT);

  const key = getLinkKey(trimmed);
  const rest = current.filter((item) => getLinkKey(item) !== key);

  return [trimmed, ...rest].slice(0, config.linkHistory.LINK_HISTORY_LIMIT);
}

export { addLinkToHistory, getLinkKey };
