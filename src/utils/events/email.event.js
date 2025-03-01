import { EventEmitter } from "node:events"
import { customAlphabet } from 'nanoid'
import { confirmEmailTemplate } from "../email/template/confrimEmail.js"
import { sendEmail } from "../email/send.email.js"
import { generateHash } from "../security/hash.js"
import userModel from "../../DB/model/User.model.js"
import { resetPasswordTemplate } from "../email/template/resetPassword.js"
import * as dbServices from "../../DB/db.service.js"
import { status } from "../enums.js"
import applicationModel from "../../DB/model/Application.model.js"
import { acceptanceEmailTemplate } from "../email/template/acceptanceEmail.js"
import { rejectionEmailTemplate } from "../email/template/rejectionEmail.js"


export const emailEvent = new EventEmitter()

export const emailSubject = {
    confirmEmail: 'confirmEmail',
    resetPassword: 'resetPassword',

}

export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {
    const { id, email, username } = data
    const otp = customAlphabet('0123456789', 4)()
    const hashOTP = generateHash({ plainText: otp, salt: process.env.SALT_ROUND })

    const newOtpEntry = {
        code: hashOTP,
        type: subject,
        expiresIn: new Date(Date.now() + 10 * 60 * 1000)
    }

    await dbServices.updateOne({
        model: userModel,
        filter: { _id: id },
        data: { $push: { OTP: newOtpEntry } }
    })

    const html = subject === emailSubject.resetPassword
        ? resetPasswordTemplate({ code: otp })
        : confirmEmailTemplate({ code: otp, username })

    await sendEmail({ to: email, subject, html })
}

emailEvent.on("sendConfirmEmail", async (data) => {
    await sendCode({ data })
})

emailEvent.on("forgetPassword", async (data) => {
    await sendCode({ data, subject: emailSubject.resetPassword })
})



// send confirmation mail

export const sendApplicationStatusEmail = async ({ data = {}, status = status.rejected } = {}) => {
    const { appId } = data

    const application = await dbServices.findOne({
        model: applicationModel,
        filter: { _id: appId },
    })
    

    if (!application) {
        throw new Error('not found application')

    }

    const user = await dbServices.findOne({
        model: userModel,
        filter: { _id: application.userId },

    })


    if (!user) {
        throw new Error('not found user')
    }

    const html = status === status.accepted
        ? acceptanceEmailTemplate({ username: user.username, jobTitle: application.jobTitle })
        : rejectionEmailTemplate({ username: user.username, jobTitle: application.jobTitle })

    await sendEmail({ to: user.email, subject: status, html })
}

emailEvent.on("applicationAccepted", async (data) => {
    await sendApplicationStatusEmail({ data, status: status.accepted })
})

emailEvent.on("applicationRejected", async (data) => {
    await sendApplicationStatusEmail({ data, status: status.rejected })
})
