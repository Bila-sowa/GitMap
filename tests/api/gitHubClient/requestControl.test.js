import { describe, test, expect, vi, afterEach } from "vitest";
import RequestControl from "@/js/api/gitHubClient/requestControl";

describe("RequestControl", () => {
  const controls = [];

  const createControl = (externalSignal, timeout) => {
    const control = new RequestControl(externalSignal, timeout);
    controls.push(control);
    return control;
  };

  afterEach(() => {
    controls.splice(0).forEach((control) => control.cleanup());
    vi.useRealTimers();
  });

  test("propagates an external abort without recording a timeout", () => {
    const reason = new Error("Cancelled by caller");
    const externalController = new AbortController();
    const request = createControl(externalController.signal, 1000);

    externalController.abort(reason);

    const result = {
      aborted: request.signal.aborted,
      didTimeout: request.didTimeout(),
      reason: request.signal.reason,
    };
    expect(result.aborted).toBe(true);
    expect(result.didTimeout).toBe(false);
    expect(result.reason).toBe(reason);
  });

  test("aborts and records a timeout after the timeout elapses", () => {
    vi.useFakeTimers();
    const request = createControl(undefined, 10);

    vi.advanceTimersByTime(10);

    const result = {
      aborted: request.signal.aborted,
      didTimeout: request.didTimeout(),
      reasonName: request.signal.reason?.name,
    };
    expect(result.aborted).toBe(true);
    expect(result.didTimeout).toBe(true);
    expect(result.reasonName).toBe("TimeoutError");
  });

  test("cleanup prevents a pending timeout from aborting the signal", () => {
    vi.useFakeTimers();
    const request = createControl(undefined, 10);

    request.cleanup();
    vi.advanceTimersByTime(20);

    const result = {
      aborted: request.signal.aborted,
      didTimeout: request.didTimeout(),
    };
    expect(result).toEqual({ aborted: false, didTimeout: false });
  });
});
