import { Router } from "express"
import * as applicationServices from './service/application.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js"
import { validation } from "../../middleware/validation.middleware.js"
import * as validators from './application.validation.js'
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js"
import { roleTypes } from "../../utils/enums.js"


const router = Router({ mergeParams: true })


router.post('/addApplication/:userId',
    authentication(), 
    authorization(roleTypes.user), 
    uploadCloudFile(fileValidations.document).single('attachment'), 
    validation(validators.addApplication), 
    applicationServices.addApplication)


router.get('/getAllApplications/:userId',
    authentication(), 
    validation(validators.getAllApplications), 
    applicationServices.getAllApplications)


router.patch('/acceptApplication/:appId',
    authentication(), 
    validation(validators.acceptOrRejectApp), 
    applicationServices.acceptApplication)


router.patch('/rejectApplication/:appId',
    authentication(), 
    validation(validators.acceptOrRejectApp), 
    applicationServices.rejectApplication)


export default router