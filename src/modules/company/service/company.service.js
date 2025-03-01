import { asyncHandler } from "../../../utils/error/error.handler.js";
import { successResponse } from "../../../utils/successResponse/success.response.js";
import * as dbService from '../../../DB/db.service.js'
import companyModel from "../../../DB/model/Company.model.js";
import { roleTypes } from "../../../utils/enums.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import userModel from "../../../DB/model/User.model.js";


export const addCompany = asyncHandler(async (req, res, next) => {
    const { companyName, companyEmail } = req.body
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/company/${req.user._id}/legalAttachment` })

    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } }
    })
    if (user.legalAttachment?.public_id) {
        await cloud.uploader.destroy(user.legalAttachment.public_id)
    }

    if (await dbService.findOne({ model: companyModel, filter: { companyName, companyEmail, deletedAt: { $exists: false } } })) {
        return next(new Error("company exists", { cause: 409 }))
    }

    const company = await dbService.create({
        model: companyModel,
        data: {
            createdBy: req.user._id,
            companyName,
            companyEmail,
            legalAttachment: { secure_url, public_id }
        }
    })

    return successResponse({ res, status: 201, message: "company created", data: { company } })
})


export const updateCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const {
        address,
        industry,
        description,
        companyName,
        numberOfEmployees,
        companyEmail,
        HRs,
        legalAttachment,
    } = req.body;

    if (legalAttachment) {
        return next(new Error("Updating legal attachment is not allowed", { cause: 400 }));
    }

    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id };

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false }, ...owner },
    });

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    if (HRs && HRs.length > 0) {
        const foundHRs = await dbService.find({
            model: userModel,
            filter: { _id: { $in: HRs } }
        });

        if (foundHRs.length !== HRs.length) {
            return next(new Error("One or more HRs do not exist in the system", { cause: 400 }));
        }
    }

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false }, ...owner },
        data: {
            address,
            industry,
            description,
            companyName,
            numberOfEmployees,
            companyEmail,
            HRs
        },
        options: { new: true }
    });

    return successResponse({
        res,
        status: 200,
        message: "Company updated successfully",
        data: { company: updatedCompany }
    });
});


export const searchCompanyByName = asyncHandler(async (req, res, next) => {
    const { companyName } = req.body

    if (!companyName) {
        return next(new Error("Company name is required", { cause: 400 }));
    }

    const company = await dbService.findOne({
        model: companyModel,
        filter: {
            companyName,
            deletedAt: { $exists: false }
        }
    })


    return successResponse({
        res,
        status: 200,
        message: "Search results",
        data: { company }
    });
});


// company logo

export const companyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/company/${companyId}/logo` })

    const company = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        data: { logo: { secure_url, public_id } },
        options: { new: true }
    })
    if (company.logo?.public_id) {
        await cloud.uploader.destroy(company.logo.public_id)
    }

    return successResponse({ res, status: 200, data: { company } })
})


export const companyCoverImage = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/company/${companyId}/coverImage` })

    const company = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        data: { coverPic: { secure_url, public_id } },
        options: { new: false }
    })
    if (company.coverPic?.public_id) {
        await cloud.uploader.destroy(company.coverPic.public_id)
    }

    return successResponse({ res, status: 200, data: { company } })
})

// delete profile images


export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        select: "logo"
    });

    if (!company || !company.logo?.public_id) {
        return next(new Error("No logo found to delete", { cause: 404 }));
    }

    await cloud.uploader.destroy(company.logo.public_id);

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        data: { logo: null },
        options: { new: true }
    });

    return successResponse({
        res,
        status: 200,
        message: "Logo deleted successfully",
        data: { company: updatedCompany }
    });
});


export const deleteCompanyCoverImage = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    const company = await dbService.findOne({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        select: "coverPic"
    });

    if (!company || !company.coverPic?.public_id) {
        return next(new Error("No cover image found to delete", { cause: 404 }));
    }

    await cloud.uploader.destroy(company.coverPic.public_id);

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false } },
        data: { coverPic: null },
        options: { new: true }
    });

    return successResponse({
        res,
        status: 200,
        message: "Cover image deleted successfully",
        data: { company: updatedCompany }
    });
});


// soft delete account

export const deleteCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id };

    const company = await dbService.findOneAndUpdate({
        model: companyModel,
        filter: { _id: companyId, deletedAt: { $exists: false }, ...owner },
        data: {
            deletedAt: Date.now(),
        },
        options: { new: true }
    })


    return company ? successResponse({ res, status: 200, data: { company } }) :
        next(new Error("not found company", { cause: 404 }))

})