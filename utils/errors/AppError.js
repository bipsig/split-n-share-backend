export class AppError extends Error {
    constructor(message, statusCode, errorCode = null, isOperational = true) {
        super(message);

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;

        this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }
}