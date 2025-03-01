import { asyncHandler } from "../../../utils/error/error.handler.js";
import { successResponse } from "../../../utils/successResponse/success.response.js";
import * as dbService from '../../../DB/db.service.js';
import jobModel from "../../../DB/model/Job.model.js";
import companyModel from "../../../DB/model/Company.model.js";
import { Types } from "mongoose";
import { pagination } from "../../../utils/pagination.js";

export const addJob = asyncHandler(async (req, res, next) => {
    const { companyId, hrId } = req.params

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, closed: { $exists: false } }
    })

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    const userId = new Types.ObjectId(req.user._id)
    const isOwner = company.createdBy.equals(userId)
    const isHR = hrId ? company.HRs.some(hr => hr.equals(new Types.ObjectId(hrId))) : false

    if (!isOwner && !isHR) {
        return next(new Error("You can't add a job for this company", { cause: 403 }))
    }

    const addedBy = isOwner ? userId : new Types.ObjectId(hrId)

    const job = await dbService.create({
        model: jobModel,
        data: {
            companyId,
            addedBy
        }
    })

    return successResponse({ res, status: 201, message: "Job  added", data: { job } })
});


export const updateJob = asyncHandler(async (req, res, next) => {
    const { companyId, jobId } = req.params
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, closed: { $exists: false } }
    })

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    const userId = new Types.ObjectId(req.user._id)
    const isOwner = company.createdBy.equals(userId)

    if (!isOwner) {
        return next(new Error("You are not authorized to update this job", { cause: 403 }))
    }

    const job = await dbService.findOne({
        model: jobModel,
        filter: { _id: jobId, companyId, closed: { $exists: false } }
    })

    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }

    const updatedJob = await dbService.findOneAndUpdate({
        model: jobModel,
        filter: { _id: jobId },
        data: {
            updatedBy: userId,
            jobTitle,
            jobLocation,
            workingTime,
            seniorityLevel,
            jobDescription,
            technicalSkills,
            softSkills
        },
        options: { new: true }
    })

    return successResponse({ res, status: 200, message: "Job  updated", data: { updatedJob } })
})


export const deleteJob = asyncHandler(async (req, res, next) => {
    const { companyId, jobId } = req.params;

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, closed: { $exists: false } }
    });

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    const userId = new Types.ObjectId(req.user._id);
    const isHR = company.HRs.some(hr => hr.equals(userId));

    if (!isHR) {
        return next(new Error("Only HRs of this company can delete a job", { cause: 403 }));
    }

    const job = await dbService.findOne({
        model: jobModel,
        filter: { _id: jobId, companyId, closed: { $exists: false } }
    });

    if (!job) {
        return next(new Error("Job not found or already deleted", { cause: 404 }));
    }

    const deletedJob = await dbService.findOneAndUpdate({
        model: jobModel,
        filter: { _id: jobId },
        data: { closed: true },
        options: { new: true }
    });

    return successResponse({ res, status: 200, message: "Job deleted successfully", data: { deletedJob } });
});


export const getAllJobs = asyncHandler(async (req, res, next) => {
    const { companyName, size, page } = req.query;
    const { companyId, jobId } = req.params;

    const filter = { closed: { $exists: false } };

    if (companyId) {
        filter.companyId = companyId;
    }

    if (jobId) {
        filter._id = jobId;
    }

    if (companyName) {
        const company = await dbService.findOne({
            model: companyModel,
            filter: { companyName, deletedAt: { $exists: false } }
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        filter.companyId = company._id;
    }

    const data = await pagination({
        page,
        size,
        model: jobModel,
        filter,
        sort: "-createdAt",
        populate: {
            path: "companyId",
        }
    });

    return successResponse({ res, status: 200, message: "All Jobs", data });
});


export const getAllJobsWithFilter = asyncHandler(async (req, res, next) => {
    const {
        size,
        page,
        workingTime,
        jobLocation,
        seniorityLevel,
        jobTitle,
        technicalSkills,
    } = req.query;

    const { companyId, jobId } = req.params;

    const filter = { closed: { $exists: false } };

    if (companyId) {
        filter.companyId = companyId
    };
    if (jobId) {
        filter._id = jobId
    };
    if (workingTime) {
        filter.workingTime = workingTime
    };
    
    if (jobLocation) {
        filter.jobLocation = jobLocation
    };
    if (seniorityLevel) {
        filter.seniorityLevel = seniorityLevel
    };
    if (jobTitle) {
        filter.jobTitle = jobTitle
    };

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id : companyId, deletedAt: { $exists: false } }
    });

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    };

    filter.companyId = company._id;

    if (technicalSkills) {
        filter.technicalSkills = {
            $in: Array.isArray(technicalSkills) ? technicalSkills : technicalSkills.split(",")
        };
    }

    const data = await pagination({
        page,
        size,
        model: jobModel,
        filter,
        sort: "-createdAt",
        populate: { path: "companyId" }
    });

    return successResponse({ res, status: 200, message: "All Jobs", data });
});
