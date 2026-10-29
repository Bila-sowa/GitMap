// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { config } from "@/js/api/config";
import notifications from "@/js/utils/notificationManager";

const getNotifications = () => [...document.querySelectorAll(".notification-container")];

const getMessages = () =>
  getNotifications().map((notification) => notification.querySelector(".text-small").textContent);

const closeActiveNotification = () => {
  document.querySelector(".notification-container .close-alert-button").click();
};

describe("notify", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await vi.runAllTimersAsync();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  test("renders the message, type, icon, and close button", async () => {
    await notifications.notify("Saved successfully", "success");

    const [notification] = getNotifications();

    expect(notification.classList.contains("success")).toBe(true);
    expect(notification.getAttribute("role")).toBe("alert");
    expect(notification.querySelector(".text-small").textContent).toBe("Saved successfully");
    expect(notification.querySelector("svg")).not.toBe(null);
    expect(notification.querySelector(".close-alert-button").getAttribute("aria-label")).toBe("Close notification");
  });

  test("queues notifications and renders them in order", async () => {
    await notifications.notify("First", "info");
    await notifications.notify("Second", "warning");

    expect(getMessages()).toStrictEqual(["First"]);

    closeActiveNotification();
    await vi.advanceTimersByTimeAsync(0);

    expect(getMessages()).toStrictEqual(["Second"]);

    closeActiveNotification();
    await vi.advanceTimersByTimeAsync(0);

    expect(getNotifications()).toStrictEqual([]);
  });

  test("removes the notification when the close button is clicked", async () => {
    await notifications.notify("Dismiss me", "error");

    closeActiveNotification();

    expect(getNotifications()).toStrictEqual([]);
  });

  test("removes the notification after the cooldown", async () => {
    await notifications.notify("Temporary", "info");

    const visibleBeforeCleanup = getNotifications().length;

    await vi.advanceTimersByTimeAsync(config.notifications.COOLDOWN_MS);

    expect(visibleBeforeCleanup).toBe(1);
    expect(getNotifications()).toStrictEqual([]);
  });

  test.each([
    { label: "an empty message", message: "", type: "info" },
    { label: "a missing type", message: "Message", type: undefined },
  ])("ignores $label", async ({ message, type }) => {
    await notifications.notify(message, type);

    expect(getNotifications()).toStrictEqual([]);
  });
});
