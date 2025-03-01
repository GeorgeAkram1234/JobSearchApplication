import { asyncHandler } from "../../../utils/error/error.handler.js";
import { successResponse } from '../../../utils/successResponse/success.response.js';
import * as dbService from '../../../DB/db.service.js'
import userModel from "../../../DB/model/User.model.js";
import { emailEvent, emailSubject } from "../../../utils/events/email.event.js";
import { compareHash } from "../../../utils/security/hash.js";


export const signup = asyncHandler(async (req, res, next) => {
    const { username, email, password, mobileNumber } = req.body

    if (await dbService.findOne({ model: userModel, filter: { email } })) {
        return next(new Error('email exist', { cause: 409 }))
    }
    const user = await dbService.create({
        model: userModel,
        data: {
            username,
            email,
            password,
            mobileNumber
        }
    })

    emailEvent.emit('sendConfirmEmail', { email, username, id: user._id })

    return successResponse({ res, message: "Signup", data: { user }, status: 201 })
})



export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })

        if (!user) {
            return next(new Error('not found user', { cause: 404 }))
        }
        if (user.isConfirmed) {
            return next(new Error('already verified', { cause: 409 }))
        }
        if (!user.OTP || user.OTP.length === 0) {
            await dbService.deleteOne({
                model: userModel,
                filter: { email },
            })
            return next(new Error("No OTP found, request a new one", { cause: 400 }));
        }

        const validOtps = user.OTP.filter(otp => new Date(otp.expiresIn) > new Date());
        await dbService.updateOne({
            model: userModel,
            filter: { email },
            data: { OTP: validOtps }
        });

        const lastOtp = validOtps.reverse().find(otp => otp.type === emailSubject.confirmEmail);

        if (!lastOtp) {

            return next(new Error("No valid OTP found, request a new one", { cause: 400 }));
        }

        if (!compareHash({ plainText: code, hashValue: lastOtp.code })) {
            return next(new Error("Wrong or expired OTP", { cause: 400 }));
        }

        await dbService.updateOne({ model: userModel, filter: { email }, data: { isConfirmed: true } })

        return successResponse({ res, status: 200, data: { user }, message: "confirmed successfully" })
    }
)


