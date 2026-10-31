import { describe, test, expect } from "vitest";
import { decrypt, encrypt, generateKey, isEncryptedValue } from "@/js/utils/cipher";

describe("cipher", () => {
  test("encrypts and decrypts a string", async () => {
    const key = await generateKey();
    const envelope = await encrypt("ghp_secretToken", key);
    const result = await decrypt(envelope, key);

    expect(result).toBe("ghp_secretToken");
  });

  test("encrypts an empty string", async () => {
    const key = await generateKey();
    const envelope = await encrypt("", key);
    const result = await decrypt(envelope, key);

    expect(result).toBe("");
  });

  test("uses a unique initialization vector for every encryption", async () => {
    const key = await generateKey();
    const first = await encrypt("ghp_secretToken", key);
    const second = await encrypt("ghp_secretToken", key);

    expect(first.iv).not.toBe(second.iv);
    expect(first.data).not.toBe(second.data);
  });

  test("rejects a tampered ciphertext", async () => {
    const key = await generateKey();
    const envelope = await encrypt("ghp_secretToken", key);
    const tampered = { ...envelope, data: btoa("tampered") };
    const result = decrypt(tampered, key);

    await expect(result).rejects.toThrow();
  });

  test("rejects a different key", async () => {
    const key = await generateKey();
    const otherKey = await generateKey();
    const envelope = await encrypt("ghp_secretToken", key);
    const result = decrypt(envelope, otherKey);

    await expect(result).rejects.toThrow();
  });

  test.each([
    { label: "null", value: null },
    { label: "an array", value: [] },
    { label: "a string", value: "ghp_token" },
    { label: "an unsupported version", value: { v: 2, iv: "aXY=", data: "ZGF0YQ==" } },
    { label: "an empty iv", value: { v: 1, iv: "", data: "ZGF0YQ==" } },
    { label: "an empty data", value: { v: 1, iv: "aXY=", data: "" } },
  ])("rejects $label as an envelope", async ({ value }) => {
    const key = await generateKey();
    const result = decrypt(value, key);

    await expect(result).rejects.toThrow(TypeError);
  });

  test("rejects a non-string plaintext", async () => {
    const key = await generateKey();
    const result = encrypt(42, key);

    await expect(result).rejects.toThrow(TypeError);
  });

  test.each([
    { label: "a valid envelope", value: { v: 1, iv: "aXY=", data: "ZGF0YQ==" }, expected: true },
    { label: "a legacy string", value: "ghp_token", expected: false },
    { label: "null", value: null, expected: false },
    { label: "an unsupported version", value: { v: 2, iv: "aXY=", data: "ZGF0YQ==" }, expected: false },
    { label: "a missing iv", value: { v: 1, data: "ZGF0YQ==" }, expected: false },
  ])("detects $label", ({ value, expected }) => {
    const result = isEncryptedValue(value);

    expect(result).toBe(expected);
  });
});
