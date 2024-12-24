export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error, showUser = true) => {
  console.error('Error:', error);

  if (showUser) {
    // You can implement your UI error notification here
    const message = error.isOperational ? error.message : 'Something went wrong';
    // Example: showErrorToast(message);
  }

  return error;
};

export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};