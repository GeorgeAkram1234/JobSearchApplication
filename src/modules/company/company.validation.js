import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addCompany = joi.object().keys({
    companyName: generalFields.username.required(),
    companyEmail: generalFields.email.required(),
    file: generalFields.file.required()
})

export const updateCompany = joi.object().keys({
    companyId : generalFields.id.required(),
    address:joi.string(),
    industry: joi.string(),
    description: joi.string(),
    companyName: joi.string(),
    numberOfEmployees: joi.number().min(11).max(20),
    companyEmail: joi.string(),
    HRs: joi.array().items(generalFields.id)
}).required()

export const companyLogo = joi.object().keys({
    companyId: generalFields.id.required(),
    file: generalFields.file.required()
}).required()

export const search = joi.object().keys({
    companyName: generalFields.username.required(),
})