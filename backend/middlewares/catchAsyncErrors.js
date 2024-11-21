export const catchAsyncErrors = (theFunction) => {
    return (req, res, next) => {
        Promise.resolve(theFunction(req, res, next)).catch(next);
    };
};

// The catchAsyncErrors function is a higher-order function in Express.js
//  that wraps an asynchronous function (such as a route handler or middleware)
//   to automatically catch any errors that occur during its execution. By using
//    Promise.resolve() to handle the function's returned Promise, and attaching .catch(next)
//     to pass any errors to the next middleware, it eliminates the need for manual try-catch blocks,
//      ensuring that errors are properly caught and handled by Express's error-handling mechanisms.