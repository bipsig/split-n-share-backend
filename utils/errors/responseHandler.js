export const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString
    };

    if (data) {
        response.data = data;
    }

    res.status(statusCode).json(response);
}

export const sendSuccess = (res, statusCode = 200, message, data = null) => {
    sendResponse(res, statusCode, true, message, data);
}

export const sendError = (res, statusCode = 500, message, errorCode = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString
    };

    if (errorCode) {
        response.errorCode = errorCode;
    }

    res.status(statusCode).json(response);
}


/*
    Basically this standardizes every response that is sent from the server to the user.

    Instead of using
    res.status().json({}) in every route, we can directly call these utils to send it directly which also ensure every response has a similar output.
*/