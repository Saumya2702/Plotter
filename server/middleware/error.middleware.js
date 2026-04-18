/**
 * Global Error Middleware
 * Catches anything passed to next(err) and returns a structured JSON response.
 * Must be registered LAST in the Express app middleware chain.
 */

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  // Use a status explicitly set on the error object, fall back to 500
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Only log stack traces in development to avoid leaking internals
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err.stack || err);
  } else {
    console.error(`[Error] ${status} — ${message}`);
  }

  res.status(status).json({
    error: message,

    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
