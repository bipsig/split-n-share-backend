export const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        fn (req, res, next).catch(next);
    }
}

/*
    Errors in Synchronous route handlers are handled implicitly but in case of asynchronous routes, the errors keep dangling without try/catch block.

    Now the problem is that we have to repeatedly write try catch for this logic and it becomes tedious and evil looking.

    So basically this is a higher order function which takes the route handler as a parameter and wraps it in form of a middleware (our error handler middleware). If an error is caught, it shall directly be handled by our middlerware without any try/catch block. 

    So the route handlers shall only have the required business logic.
*/