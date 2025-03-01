import { Router } from "express"
import * as companyServices from './service/company.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js"
import { endpoint } from "./company.authorization.js"
import { validation } from "../../middleware/validation.middleware.js"
import * as validators from './company.validation.js'
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js"
import jobController from '../jobOpportunity/job.controller.js'

const router = Router()


router.use('/:companyId/job' , jobController)


router.post('/',
    authentication(),
    uploadCloudFile(fileValidations.document).single('attachment'),
    validation(validators.addCompany),
    companyServices.addCompany)

    
router.patch('/:companyId',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    validation(validators.updateCompany),
    companyServices.updateCompany
);

router.get('/searchCompanyByName',
    authentication(),
    validation(validators.search),
    companyServices.searchCompanyByName
);

router.patch('/logo/:companyId',
    validation(validators.companyLogo),
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    companyServices.companyLogo
)

router.patch('/coverImage/:companyId',
    validation(validators.companyLogo),
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    companyServices.companyCoverImage
)

router.delete('/deleteLogo/:companyId',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    companyServices.deleteCompanyLogo
)

router.delete('/deleteCoverImage/:companyId',
    authentication(),
    uploadCloudFile(fileValidations.image).single('attachment'),
    companyServices.deleteCompanyCoverImage
)

router.delete('/deleteCompany/:companyId',
    authentication(),
    companyServices.deleteCompany
)





export default router