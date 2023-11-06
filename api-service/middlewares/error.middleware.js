import CustomError from '../errors/CustomError.js';

function errorHandler(error, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';
  const message = error instanceof CustomError ? error.message : 'Internal Server Error';
  const status = error.status || 500;

  if (status === 401) res.clearCookie('refresh_token');

  res.status(status).json({
    status,
    message,
    info: error.info,
    // only for development
    stack: isDev ? error.stack : undefined,
    details: isDev ? error.message : undefined,
  });
}

export default errorHandler;