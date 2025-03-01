

import { verifyToken } from "../../utils/security/token.js"
import * as dbServices from '../../DB/db.service.js'
import userModel from "../../DB/model/User.model.js"
import { tokenTypes } from "../../utils/enums.js"


export const authentication = async ({
    socket = {},
    tokenType = tokenTypes.access,
    accessRoles = [],
    checkAuthorization = false } = {}) => {


    const [bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || []
    if (!bearer || !token) {
        return { data: { message: "in-valid token parts", status: 400 } }
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
        return { data: { message: "in-valid payload", status: 401 } }
    }

    const user = await dbServices.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: { $exists: false } } })


    if (!user) {
        return { data: { message: "not registered account", status: 404 } }
    }
    if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
        return { data: { message: "in valid login credentials", status: 400 } }
    }

    if (checkAuthorization && !accessRoles.includes(user.role)) {
        return { data: { message: "not authorized account", status: 403 } }
    }

    return { data: { message: "Done", user }, valid: true }

}
