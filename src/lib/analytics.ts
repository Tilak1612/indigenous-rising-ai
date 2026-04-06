type EventPayload = {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
};

const QUEUE_KEY = 'analytics-queue-v1';

export const trackEvent = (event: string, properties: Record<string, any> = {}) => {
  const payload: EventPayload = { event, properties, timestamp: new Date().toISOString() };
  // Best-effort: send to console and persist to queue for server-side batching later
  try {
    // push to local queue
    const raw = localStorage.getItem(QUEUE_KEY) || '[]';
    const arr = JSON.parse(raw);
    arr.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
  } catch (e) {
    // ignore
  }

  // lightweight sender (non-blocking): in production, replace with real analytics SDK call
};

export const flushEvents = async () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY) || '[]';
    const arr = JSON.parse(raw);
    if (!arr.length) return;
    // Placeholder: in production POST to analytics endpoint
    localStorage.removeItem(QUEUE_KEY);
  } catch (e) {
    // ignore
  }
};

export default { trackEvent, flushEvents };
