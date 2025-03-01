import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";


export const addJob = joi.object().keys({
    companyId: generalFields.id.required(),
    hrId: generalFields.id,
})

export const getAllJobs = joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id,
    companyName: joi.string(),
    size : joi.number(), 
    page : joi.number()
})
export const getAllJobsWithFilter = joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id,
    workingTime: joi.string(),
    jobLocation: joi.string(),
    seniorityLevel: joi.string(),
    jobTitle: joi.string(),
    technicalSkills: joi.string(),
    size : joi.number(), 
    page : joi.number()
})


export const updateJob = joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id,
    jobTitle: joi.string(),
    jobLocation: joi.string(),
    workingTime: joi.string(),
    seniorityLevel: joi.string(),
    jobDescription: joi.string(),
    technicalSkills: joi.array(),
    softSkills: joi.array(),
    updatedBy: generalFields.id,
})

