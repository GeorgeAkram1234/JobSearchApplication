import { successResponse } from "../../../utils/successResponse/success.response.js"
import * as dbService from '../../../DB/db.service.js'
import { asyncHandler } from "../../../utils/error/error.handler.js"
import { generateDecryption, generateEncryption } from "../../../utils/security/encryption.js"
import userModel from "../../../DB/model/User.model.js"
import { cloud } from "../../../utils/multer/cloudinary.multer.js"


export const updateUser = asyncHandler(async (req, res, next) => {
    const { mobileNumber, DOB, firstName, lastName, gender } = req.body

    const user = await dbService.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            mobileNumber: generateEncryption({ plainText: mobileNumber, signature: process.env.ENCRYPTION_SIGNATURE }),
            DOB,
            firstName,
            lastName,
            gender
        },
        options: {
            new: true
        }
    })
    if (!user) {
        return next(new Error("not found user", { cause: 404 }))
    }

    return successResponse({ res, data: { user }, message: "user updated" })
})


export const viewUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    const user = await dbService.findOne({
        model: userModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: false },
        },
        select: "firstName lastName mobileNumber profilePic coverPic"
    });

    if (!user) {
        return next(new Error("not found user", { cause: 404 }))
    }

    if (user && user.mobileNumber) {
        user.mobileNumber = generateDecryption({ cipherText: user.mobileNumber });
    }

    return successResponse({ res, data: { user }, message: "user viewed" });

});


// profile images

export const profileImage = asyncHandler(async (req, res, next) => {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/user/${req.user._id}/profile` })

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } },
        data: { profilePic: { secure_url, public_id } },
        options: { new: false }
    })
    if (user.profilePic?.public_id) {
        await cloud.uploader.destroy(user.profilePic.public_id)
    }

    return successResponse({ res, status: 200, data: { user } })
})


export const profileCoverImage = asyncHandler(async (req, res, next) => {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path,
        { folder: `${process.env.app_name}/user/${req.user._id}/coverImage` })

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } },
        data: { coverPic: { secure_url, public_id } },
        options: { new: false }
    })
    if (user.coverPic?.public_id) {
        await cloud.uploader.destroy(user.coverPic.public_id)
    }

    return successResponse({ res, status: 200, data: { user } })
})


// delete profile images


export const deleteProfileImage = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } },
        select: "profilePic"
    });

    if (!user || !user.profilePic?.public_id) {
        return next(new Error("No profile image found to delete", { cause: 404 }));
    }

    await cloud.uploader.destroy(user.profilePic.public_id);

    await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $unset: { profilePic: 1 } },
        options: { new: true }
    });

    return successResponse({
        res,
        status: 200,
        message: "Profile image deleted successfully"
    });
});

export const deleteProfileCoverImage = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } },
        select: "coverPic"
    });

    if (!user || !user.coverPic?.public_id) {
        return next(new Error("No cover image found to delete", { cause: 404 }));
    }

    await cloud.uploader.destroy(user.coverPic.public_id);

    const updatedUser = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $unset: { coverPic: 1 } }, 
        options: { new: true }
    });

    return successResponse({
        res,
        status: 200,
        data: { user: updatedUser },
        message: "Cover image deleted successfully"
    });
});


// soft delete account

export const deleteUser = asyncHandler(async (req, res, next) => {


    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, deletedAt: { $exists: false } },
        data: {
            deletedAt: Date.now(),
            updatedBy: req.user._id,
        },
        options: { new: true }
    })


    return user ? successResponse({ res, status: 200, data: { user } , message : 'account deleted' }) :
        next(new Error("not found user", { cause: 404 }))

})