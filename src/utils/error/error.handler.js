

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(error => {
            return next(error, { cause: 500 })
        })
    }
}


export const globalErrorHandler = (error, req, res, next) => {
    if (process.env.MODE == 'DEV') {
        return res.status(error.cause || 400).json({
            error,
            message: error.message,
            stack: error.stack,
            msg: "global error"
        })
    }

    return res.status(error.cause || 400).json({
        message: error.message,
        msg: "global error"
    })
}