import { Router } from "express";
import * as jobServices from './service/job.service.js'
import { authentication } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from './job.validation.js'
import applicationController from '../application/application.controller.js'


const router = Router({ mergeParams: true })

router.use('/:jobId/application' , applicationController)

router.post('/:hrId?',
    authentication(),
    validation(validators.addJob),
    jobServices.addJob)


router.patch('/:jobId',
    authentication(),
    validation(validators.updateJob),
    jobServices.updateJob)


router.delete('/:jobId',
    authentication(),
    jobServices.deleteJob)

router.get('/:jobId?',
    authentication(),
    validation(validators.getAllJobs),
    jobServices.getAllJobs)

router.get('/filteration/jobs/:jobId?',
    authentication(),
    validation(validators.getAllJobsWithFilter),
    jobServices.getAllJobsWithFilter)


export default router