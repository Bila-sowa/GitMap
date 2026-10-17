import { describe, test, expect } from "vitest";
import { Formatter } from "@/js/utils/formatter";

describe("Formatter", () => {
  const formatter = new Formatter();
  const rawData = {
    name: "update tests\n\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
    date: "2026-08-16T12:55:32Z",
    hash: "35c2ab6d6ac3526a22a21d0a83c6309f574daeac",
    file: {
      name: "example.js",
      status: "modifed",
    },
  };

  test("formats name", () => {
    const result = {
      title: formatter.getFormattedTitle(rawData.name),
      description: formatter.getFormattedDescription(rawData.name),
    };

    expect(result.title).toBe("update tests");
    expect(result.description).toBe(
      "\n- getGitHubData.test.js has been split into smaller modules\n- update testTools.js",
    );
  });

  test("formats date", () => {
    const result = formatter.getDateInLocaleString(rawData.date);
    expect(result).toBe("8/16/2026, 3:55:32 PM");
  });

  test("formats hash", () => {
    const result = formatter.getShortHash(rawData.hash);

    expect(result).toBe("35c2ab6");
  });

  test("formats file", () => {
    const result = {
      extension: formatter.getFormattedExtension(rawData.file.name),
      status: formatter.getShortStatus(rawData.file.status),
    };

    expect(result.extension).toBe("js");
    expect(result.status).toBe("M");
  });
});
