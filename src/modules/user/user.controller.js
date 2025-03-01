import { Router } from "express";
import * as userServices from "./service/user.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { roleTypes } from "../../utils/enums.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js";
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js";

const router = Router()


router.patch('/',
    authentication(),
    authorization(roleTypes.user),
    validation(validators.updateUser),
    userServices.updateUser)

router.get('/:userId',
    authentication(),
    validation(validators.viewUser),
    userServices.viewUser)

router.patch('/profile-pic',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    validation(validators.profileImage),
    userServices.profileImage
)

router.patch('/profile/cover',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    validation(validators.profileImage),
    userServices.profileCoverImage
)


router.delete('/profile-pic',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    userServices.deleteProfileImage
)

router.delete('/profile/cover',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    userServices.deleteProfileCoverImage
)


router.delete('/' ,
    authentication(),
    userServices.deleteUser
)

export default router