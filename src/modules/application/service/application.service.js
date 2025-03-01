import { asyncHandler } from "../../../utils/error/error.handler.js";
import { successResponse } from "../../../utils/successResponse/success.response.js";
import * as dbService from '../../../DB/db.service.js'
import applicationModel from "../../../DB/model/Application.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { status } from "../../../utils/enums.js";
import { pagination } from "../../../utils/pagination.js";
import companyModel from "../../../DB/model/Company.model.js";
import { Types } from "mongoose";
import { emailEvent } from "../../../utils/events/email.event.js";

export const addApplication = asyncHandler(async (req, res, next) => {
    const { jobId, userId } = req.params
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/job/${jobId}/userCV` })

    if (!jobId) {
        return next(new Error('missing job Id ', { cause: 404 }))
    }
    if (!userId) {
        return next(new Error('missing user Id ', { cause: 404 }))
    }

    if (req.user._id == userId) {
        return next(new Error('only users can apply and you are an HR', { cause: 400 }))
    }


    const application = await dbService.create({
        model: applicationModel,
        data: {
            userId,
            jobId,
            userCV: { secure_url, public_id }
        }
    })

    if (application.userCV?.public_id) {
        await cloud.uploader.destroy(application.userCV.public_id)
    }


    return successResponse({ res, message: "application added ", status: 201, data: { application } })
})


export const getAllApplications = asyncHandler(async (req, res, next) => {
    const { companyId, jobId, userId } = req.params;
    const { size, page } = req.query;

    if (!jobId) {
        return next(new Error('Missing jobId', { cause: 400 }));
    }
    if (!userId) {
        return next(new Error('Missing userId', { cause: 400 }));
    }

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } }
    });

    if (!company) {
        return next(new Error("No company found ", { cause: 404 }));
    }

    const isOwner = company.createdBy.equals(userId);
    const isHR = company.HRs.some(hr => hr.equals(new Types.ObjectId(userId)));

    if (!isOwner && !isHR) {
        return next(new Error("You are not authorized to view these applications", { cause: 403 }));
    }

    const data = await pagination({
        page,
        size,
        model: applicationModel,
        filter: { jobId },
        sort: "-createdAt",
        populate: { path: "userId", select: "-password" }
    });

    return successResponse({ res, message: "Applications retrieved", status: 200, data });
});




export const acceptApplication = asyncHandler(async (req, res, next) => {
    const { companyId, jobId, appId } = req.params;

    if (!jobId || !appId) {
        return next(new Error('Missing jobId or appId', { cause: 400 }));
    }

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } }
    });

    if (!company) {
        return next(new Error("No company found", { cause: 404 }));
    }

    const isHR = company.HRs.some(hr => hr.equals(new Types.ObjectId(req.user._id)));

    if (!isHR) {
        return next(new Error("You are not authorized to accept this application", { cause: 403 }));
    }

    const acceptance = await dbService.findOneAndUpdate({
        model: applicationModel,
        filter: { _id: appId },
        data: { status: status.accepted },
        options: { new: true }
    });

    emailEvent.emit("applicationAccepted", { appId });

    return successResponse({ res, message: "Application accepted", status: 200, data: { acceptance } });
});


export const rejectApplication = asyncHandler(async (req, res, next) => {
    const { companyId, jobId, appId } = req.params;

    if (!jobId || !appId) {
        return next(new Error('Missing jobId or appId', { cause: 400 }));
    }

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } }
    });

    if (!company) {
        return next(new Error("No company found", { cause: 404 }));
    }

    const isHR = company.HRs.some(hr => hr.equals(new Types.ObjectId(req.user._id)));

    if (!isHR) {
        return next(new Error("You are not authorized to reject this application", { cause: 403 }));
    }

    const rejection = await dbService.findOneAndUpdate({
        model: applicationModel,
        filter: { _id: appId },
        data: { status: status.rejected },
        options: { new: true }
    });

    emailEvent.emit("applicationRejected", { appId });

    return successResponse({ res, message: "Application rejected", status: 200, data: { rejection } });
});
