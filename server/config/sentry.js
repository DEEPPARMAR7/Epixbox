const Sentry = require('@sentry/node');

const dsn = process.env.SENTRY_DSN;
const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
}

module.exports = {
  Sentry,
  sentryEnabled,
};
