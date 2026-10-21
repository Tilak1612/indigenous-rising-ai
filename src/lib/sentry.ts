import * as Sentry from "@sentry/react";

/** Keep customer records, URLs, breadcrumbs and arbitrary context out of telemetry. */
export function scrubError(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  return {
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    environment: event.environment,
    release: event.release,
    sdk: event.sdk,
    exception: {
      values: event.exception?.values?.map((exception) => ({
        type: exception.type,
        value: "Application error",
        mechanism: exception.mechanism ? {
          type: exception.mechanism.type, handled: exception.mechanism.handled,
        } : undefined,
        stacktrace: {
          frames: exception.stacktrace?.frames?.map((frame) => ({
            filename: frame.filename?.split(/[?#]/)[0],
            abs_path: frame.abs_path?.split(/[?#]/)[0],
            function: frame.function,
            lineno: frame.lineno,
            colno: frame.colno,
            in_app: frame.in_app,
          })),
        },
      })),
    },
  };
}

export function scrubSpan(span: Sentry.StreamedSpanJSON): Sentry.StreamedSpanJSON {
  const safeKeys = ["sentry.op", "sentry.origin", "sentry.sample_rate", "http.response.status_code"];
  return {
    trace_id: span.trace_id,
    parent_span_id: span.parent_span_id,
    span_id: span.span_id,
    start_timestamp: span.start_timestamp,
    end_timestamp: span.end_timestamp,
    status: span.status,
    is_segment: span.is_segment,
    name: String(span.attributes["sentry.op"] ?? "application"),
    attributes: Object.fromEntries(
      Object.entries(span.attributes).filter(([key]) => safeKeys.includes(key)),
    ),
  };
}

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (typeof window === "undefined" || !import.meta.env.PROD || !dsn || Sentry.getClient()) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE === "mobile" ? "mobile" : "production",
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    // No DOM recording, console logs, client records or cross-origin trace headers.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.05,
    tracePropagationTargets: [],
    beforeBreadcrumb: () => null,
    beforeSend: scrubError,
    beforeSendSpan: scrubSpan,
  });
}

export function captureAppError(error: unknown) {
  if (Sentry.getClient()) Sentry.captureException(error);
}

// Import this module before the application so bootstrap errors are captured.
initSentry();
