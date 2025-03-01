import userModel from "../../../DB/model/User.model.js";
import { providers, roleTypes, tokenTypes } from "../../../utils/enums.js";
import { asyncHandler } from "../../../utils/error/error.handler.js";
import { successResponse } from '../../../utils/successResponse/success.response.js';
import * as dbServices from '../../../DB/db.service.js'
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { decodedToken, generateToken } from "../../../utils/security/token.js";
import { emailEvent, emailSubject } from "../../../utils/events/email.event.js";
import { OAuth2Client } from 'google-auth-library';


export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    const user = await dbServices.findOne({ model: userModel, filter: { email, provider: providers.system } })

    if (!user) {
        return next(new Error('in valid account', { cause: 404 }))
    }

    if (!user.isConfirmed) {
        return next(new Error('verify your account first', { cause: 400 }))
    }

    if (!compareHash({ plainText: password, hashValue: user.password })) {
        return next(new Error('in-valid credentials', { cause: 404 }))
    }

    const access_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        options: { expiresIn: '1h' }
    })
    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        options: { expiresIn: 60 * 60 * 24 * 7 }
    })


    return successResponse({ res, status: 200, data: { token: { access_token, refresh_token } }, message: "login" })
})

export const signupWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;

    const client = new OAuth2Client();

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        return ticket.getPayload();
    }

    const payload = await verify();

    if (!payload.email_verified) {
        return next(new Error("Invalid account. Email is not verified.", { cause: 400 }));
    }

    let existingUser = await dbServices.findOne({ model: userModel, filter: { email: payload.email } });
    if (existingUser) {
        return next(new Error("User already exists. Please log in instead.", { cause: 400 }));
    }

    const newUser = await dbServices.create({
        model: userModel,
        data: {
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            isConfirmed: payload.email_verified,
            profilePic: { secure_url: payload.picture },
            provider: providers.google,
            role: roleTypes.user, 
        }
    });

    const access_token = generateToken({
        payload: { id: newUser._id },
        signature: process.env.USER_ACCESS_TOKEN,
        options: { expiresIn: "1h" }
    });

    const refresh_token = generateToken({
        payload: { id: newUser._id },
        signature: process.env.USER_REFRESH_TOKEN,
        options: { expiresIn: 60 * 60 * 24 * 7 }
    });

    // Return response
    return successResponse({
        res,
        status: 201,
        data: { token: { access_token, refresh_token } },
        message: "Signup successful"
    });
});


export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body


    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload
    }
    const payload = await verify()

    if (!payload.email_verified) {
        return next(new Error('in valid account', { cause: 400 }))
    }

    let user = await dbServices.findOne({ model: userModel, filter: { email: payload.email } })
    if (!user) {
        user = await dbServices.create({
            model: userModel,
            data: {
                username: payload.name,
                email: payload.email,
                confirmEmail: payload.email_verified,
                image: payload.picture,
                provider: providerTypes.google
            }
        })
    }

    if (user.provider != providerTypes.google) {
        return next(new Error('in valid provider', { cause: 400 }))
    }


    const access_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        options: { expiresIn: '1h' }
    })
    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        options: { expiresIn: 60 * 60 * 24 * 7 }
    })


    return successResponse({ res, status: 200, data: { token: { access_token, refresh_token } }, message: "login" })
})

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers
    const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next })

    const access_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
        options: { expiresIn: '1h' }
    })
    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: [roleTypes.admin].includes(user.role) ?
            process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        options: { expiresIn: 60 * 60 * 24 * 7 }
    })


    return successResponse({
        res,
        status: 200,
        data: { token: { access_token, refresh_token } },
        message: "refresh Token"
    })
})



// forget password

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body

    const user = await dbServices.findOne({ model: userModel, filter: { email, deletedAt: { $exists: false } } })

    if (!user) {
        return next(new Error("not registered account", { cause: 404 }))
    }
    if (!user.isConfirmed) {
        return next(new Error("confirm your email first", { cause: 400 }))
    }

    emailEvent.emit('forgetPassword', { id: user._id, email, username: user.username })
    return successResponse({ res, status: 200, data: { msg: 'check your email' }, message: "forget password" })

})

export const validateForgetPassword = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    const user = await dbServices.findOne({
        model: userModel,
        filter: { email, deletedAt: { $exists: false } }
    });

    if (!user) {
        return next(new Error("Not a registered account", { cause: 404 }));
    }
    if (!user.isConfirmed) {
        return next(new Error("Confirm your email first", { cause: 400 }));
    }
    if (!user.OTP || user.OTP.length === 0) {
        return next(new Error("No OTP found, request a new one", { cause: 400 }));
    }

    const validOtps = user.OTP.filter(otp => new Date(otp.expiresIn) > new Date());
    await dbServices.updateOne({
        model: userModel,
        filter: { email },
        data: { OTP: validOtps }
    });

    const lastOtp = validOtps.reverse().find(otp => otp.type === emailSubject.resetPassword);

    if (!lastOtp) {

        return next(new Error("No valid OTP found, request a new one", { cause: 400 }));
    }

    if (!compareHash({ plainText: code, hashValue: lastOtp.code })) {
        return next(new Error("Wrong or expired OTP", { cause: 400 }));
    }

    return successResponse({ res, status: 200, message: "OTP validated successfully", data: { msg: "done" } });
});


export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body;

    const user = await dbServices.findOne({
        model: userModel,
        filter: { email, deletedAt: { $exists: false } }
    });

    if (!user) {
        return next(new Error("Not a registered account", { cause: 404 }));
    }
    if (!user.isConfirmed) {
        return next(new Error("Confirm your email first", { cause: 400 }));
    }
    if (!user.OTP || user.OTP.length === 0) {
        return next(new Error("No OTP found, request a new one", { cause: 400 }));
    }

    const validOtps = user.OTP.filter(otp => new Date(otp.expiresIn) > new Date());
    await dbServices.updateOne({
        model: userModel,
        filter: { email },
        data: { OTP: validOtps }
    });

    const lastOtp = validOtps.reverse().find(otp => otp.type === emailSubject.resetPassword);

    if (!lastOtp) {
        return next(new Error("No valid OTP found, request a new one", { cause: 400 }));
    }

    if (!compareHash({ plainText: code, hashValue: lastOtp.code })) {
        return next(new Error("Wrong or expired OTP", { cause: 400 }));
    }

    await dbServices.updateOne({
        model: userModel,
        filter: { email },
        data: {
            password: generateHash({ plainText: password }),
            changeCredentialTime: Date.now()
        }
    });

    return successResponse({ res, status: 200, message: "Password reset successful", data: { msg: "done" } });
});
