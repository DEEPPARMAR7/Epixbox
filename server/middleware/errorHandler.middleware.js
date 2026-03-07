module.exports = function errorHandler(err, req, res, next) {
  console.error('Error:', err.stack || err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
};
