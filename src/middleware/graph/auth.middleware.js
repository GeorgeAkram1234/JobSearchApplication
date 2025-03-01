

import { tokenTypes } from "../../utils/enums.js"
import { verifyToken } from "../../utils/security/token.js"
import * as dbServices from '../../DB/db.service.js'
import userModel from "../../DB/model/User.model.js"


export const authentication = async ({
    authorization = '',
    tokenType = tokenTypes.access,
    accessRoles = [],
    checkAuthorization = false } = {}) => {


    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        throw new Error("in-valid token parts")
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

    const decoded = verifyToken({
        token, signature: tokenType === tokenTypes.access ?
            access_signature : refresh_signature
    })


    if (!decoded?.id) {
        throw new Error("in-valid payload")
    }

    const user = await dbServices.findOne({
        model: userModel,
        filter: {
            _id: decoded.id,
            deletedAt: { $exists: false }
        }
    })


    if (!user) {
        throw new Error("not registered account")
    }
    if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
        throw new Error("in valid login credentials")
    }

    if (checkAuthorization && !accessRoles.includes(user.role)) {
        throw new Error("not authorized account")
    }

    return user

}
