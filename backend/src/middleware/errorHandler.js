const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (
    error.code === '28P01' ||
    error.code === '3D000' ||
    error.code === 'ECONNREFUSED'
  ) {
    return res.status(503).json({
      message:
        'Database connection failed. Check DATABASE_URL credentials and ensure PostgreSQL is running.',
    });
  }

  if (error.status && error.message) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error.' });
};

module.exports = {
  errorHandler,
};
