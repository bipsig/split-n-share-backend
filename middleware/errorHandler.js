export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        errorCode: err.errorCode,
        stack: err.stack,
        timestamp: err.timestamp || new Date().toISOString()
    });
};