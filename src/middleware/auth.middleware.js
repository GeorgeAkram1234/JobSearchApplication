
import { asyncHandler } from "../utils/error/error.handler.js";
import { decodedToken } from "../utils/security/token.js";


export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers
        req.user = await decodedToken({ authorization, next })
        
        return next()
    })
}

export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {

        if (!accessRoles.includes(req.user.role)) {
            return next(new Error("not authorized account", { cause: 403 }))
        }
        return next()
    })

}