import jwt from 'jsonwebtoken'
import * as dbServices from '../../DB/db.service.js'
import userModel from '../../DB/model/User.model.js'
import { tokenTypes } from '../enums.js'

export const generateToken = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, options = {} } = {}) => {
    const token = jwt.sign(payload, signature, options)
    return token
}

export const verifyToken = ({ token = "", signature = process.env.TOKEN_SIGNATURE } = {}) => {
    const decoded = jwt.verify(token, signature)
    return decoded
}


export const decodedToken = async ({ authorization = "", tokenType = tokenTypes.access, next = {} } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        return next(new Error("in-valid token parts", { cause: 400 }))
    }


    let access_signature
    let refresh_signature

    switch (bearer) {
        case 'system':
        case 'System':
            access_signature = process.env.ADMIN_ACCESS_TOKEN
            refresh_signature = process.env.ADMIN_REFRESH_TOKEN
            break;
        case 'bearer':
        case 'Bearer':
            access_signature = process.env.USER_ACCESS_TOKEN
            refresh_signature = process.env.USER_REFRESH_TOKEN
            break;
        default:
            break;
    }

    const decoded = verifyToken({ token, signature: tokenType === tokenTypes.access ? access_signature : refresh_signature })


    if (!decoded?.id) {
        return next(new Error("in-valid payload", { cause: 401 }))
    }

    const user = await dbServices.findOne({ model: userModel, filter: { _id: decoded.id, deletedAt: { $exists: false } } })


    if (!user) {
        return next(new Error("not registered account", { cause: 404 }))
    }
    if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error("in valid login credentials", { cause: 400 }))
    }

    return user
}
