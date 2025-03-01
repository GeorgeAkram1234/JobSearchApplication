import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";


export const addApplication = joi.object().keys({
    jobId :generalFields.id.required(),
    userId :generalFields.id.required(),
    companyId :generalFields.id.required(),
    file : generalFields.file
})


export const getAllApplications = joi.object().keys({
    jobId :generalFields.id.required(),
    userId :generalFields.id.required(),
    companyId :generalFields.id.required(),
    page: joi.number(),
    size: joi.number(),
    
})
export const acceptOrRejectApp = joi.object().keys({
    jobId :generalFields.id.required(),
    appId :generalFields.id.required(),
    companyId :generalFields.id.required(),
})