const autocannon = require('autocannon');

const baseUrl = process.env.LOAD_TEST_BASE_URL || 'http://localhost:4000';

function run(url, title) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections: Number(process.env.LOAD_TEST_CONNECTIONS || 30),
        duration: Number(process.env.LOAD_TEST_DURATION || 15),
      },
      (err, result) => {
        if (err) return reject(err);
        console.log(`\n=== ${title} ===`);
        console.log(`Req/sec avg: ${result.requests.average}`);
        console.log(`Latency avg: ${result.latency.average} ms`);
        console.log(`Errors: ${result.errors}`);
        return resolve();
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

(async () => {
  try {
    await run(`${baseUrl}/health`, 'Health Endpoint');
    await run(`${baseUrl}/api/v1/docs`, 'Versioned API Docs Endpoint');
  } catch (err) {
    console.error('Load test failed:', err.message);
    process.exit(1);
  }
})();
