import { afterEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  getClient: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: "BrowserTracing" })),
}));
vi.mock("@sentry/react", () => sdk);
import { captureAppError, initSentry, scrubError, scrubSpan } from "./sentry";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("private error reporting", () => {
  it("removes customer data but retains useful error locations", () => {
    const event = scrubError({
      event_id: "test-event",
      user: { email: "customer@example.com", id: "private-id" },
      request: { url: "https://app.test/pets/private-id?token=secret", data: "health record" },
      extra: { record: "sensitive" },
      contexts: { customer: { identity: "sensitive" } },
      breadcrumbs: [{ message: "private record" }],
      message: "private record",
      exception: { values: [{
        type: "TypeError",
        value: "customer@example.com private record",
        stacktrace: { frames: [{
          filename: "https://app.test/assets/app.js?token=secret#record",
          function: "render",
          lineno: 42,
          vars: { token: "secret" },
        }] },
      }] },
    });
    expect(JSON.stringify(event)).not.toMatch(/customer@example|private-id|secret|sensitive|private record/);
    expect(event.exception?.values?.[0]).toMatchObject({
      type: "TypeError",
      value: "Application error",
      stacktrace: { frames: [{ filename: "https://app.test/assets/app.js", function: "render", lineno: 42 }] },
    });
  });

  it("does not send URLs, headers or customer attributes in spans", () => {
    const span = scrubSpan({
      trace_id: "trace", span_id: "span", name: "GET /records/private-id",
      start_timestamp: 1, end_timestamp: 2, is_segment: true, status: "ok",
      attributes: { "sentry.op": "http.client", "http.response.status_code": 200,
        "url.full": "https://app.test/?token=secret", email: "customer@example.com" },
      links: [{ trace_id: "private-link", span_id: "private-span" }],
    });
    expect(JSON.stringify(span)).not.toMatch(/private-id|secret|customer@example|private-link/);
    expect(span.name).toBe("http.client");
    expect(span.attributes["http.response.status_code"]).toBe(200);
  });

  it("stays inert in development or without a DSN", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("PROD", false);
    vi.stubEnv("VITE_SENTRY_DSN", "https://public@example.com/1");
    initSentry();
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_SENTRY_DSN", "");
    initSentry();
    expect(sdk.init).not.toHaveBeenCalled();
  });

  it("captures handled failures only after the SDK exists", () => {
    const error = new Error("render failed");
    sdk.getClient.mockReturnValueOnce(undefined);
    captureAppError(error);
    expect(sdk.captureException).not.toHaveBeenCalled();
    sdk.getClient.mockReturnValueOnce({});
    captureAppError(error);
    expect(sdk.captureException).toHaveBeenCalledWith(error);
  });
});
