import joi from "joi"
import { Types } from "mongoose"
import { genderTypes } from "../../DB/model/User.model.js"

export const isValidObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("invalid object Id")
}
const fileObject = {
    fieldname: joi.string().valid('attachment'),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    finalPath: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number()
}

export const generalFields = {
    username: joi.string().min(2).max(50),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net'] } }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#&<>@\"~:$^%{}?]).{8,}$/)),
    confirmationPassword: joi.string(),
    code: joi.string().pattern(new RegExp(/^\d{4}$/)),
    id: joi.string().custom(isValidObjectId),
    DOB: joi.date().less('now'),
    address: joi.string(),
    gender: joi.string().valid(...Object.values(genderTypes)),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    fileObject,
    file: joi.object().keys(fileObject)
}


export const validation = async (schema, args) => {

    const validationResult = schema.validate(args, { abortEarly: false })
    if (validationResult.error) {
        throw new Error(validationResult.error.toString())
    }
    return true
}