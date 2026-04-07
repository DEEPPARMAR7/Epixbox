const REQUESTS_WINDOW_SIZE = Number(process.env.RATE_ANALYTICS_WINDOW_SIZE || 1000);
const pathCounters = new Map();
const statusCounters = new Map();
const methodCounters = new Map();
const history = [];

let totalRequests = 0;
let totalErrors = 0;
let startedAt = Date.now();

function incrementMap(map, key) {
  const k = String(key || 'unknown');
  map.set(k, (map.get(k) || 0) + 1);
}

function recordRequest({ method, path, statusCode, durationMs }) {
  totalRequests += 1;
  if (Number(statusCode) >= 400) totalErrors += 1;

  incrementMap(pathCounters, path);
  incrementMap(statusCounters, statusCode);
  incrementMap(methodCounters, method);

  history.push({
    ts: Date.now(),
    method: String(method || 'GET'),
    path: String(path || '/'),
    statusCode: Number(statusCode || 0),
    durationMs: Number(durationMs || 0),
  });

  if (history.length > REQUESTS_WINDOW_SIZE) {
    history.shift();
  }
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function getRateAnalytics() {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const fifteenMinutesAgo = now - 15 * 60 * 1000;

  const minuteEvents = history.filter((h) => h.ts >= oneMinuteAgo);
  const fiveMinuteEvents = history.filter((h) => h.ts >= fiveMinutesAgo);
  const fifteenMinuteEvents = history.filter((h) => h.ts >= fifteenMinutesAgo);

  const avgLatency = minuteEvents.length
    ? minuteEvents.reduce((sum, h) => sum + h.durationMs, 0) / minuteEvents.length
    : 0;

  return {
    uptimeSeconds: Math.floor((now - startedAt) / 1000),
    totals: {
      requests: totalRequests,
      errors: totalErrors,
      errorRate: totalRequests ? Number(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
    },
    live: {
      requestsPerMinute: minuteEvents.length,
      requestsLast5Minutes: fiveMinuteEvents.length,
      requestsLast15Minutes: fifteenMinuteEvents.length,
      avgLatencyMsLastMinute: Number(avgLatency.toFixed(2)),
    },
    topPaths: topEntries(pathCounters, 10),
    statusCodes: topEntries(statusCounters, 10),
    methods: topEntries(methodCounters, 10),
    samplesRetained: history.length,
  };
}

module.exports = {
  recordRequest,
  getRateAnalytics,
};
