import { Router } from "express";
import * as registrationServices from "./service/registration.service.js";
import * as loginServices from "./service/login.service.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./auth.validation.js";

const router = Router()



router.post('/signup', validation(validators.signup), registrationServices.signup)
router.post('/confirmEmail', validation(validators.confirmEmail), registrationServices.confirmEmail)
router.post('/login', validation(validators.login), loginServices.login)
router.post('/signupWithGmail', loginServices.signupWithGmail)
router.post('/loginWithGmail', loginServices.loginWithGmail)

router.post('/refresh-token', loginServices.refreshToken)

router.patch('/forget-password', validation(validators.forgetPassword), loginServices.forgetPassword)
router.patch('/validate-forget-password', validation(validators.validateForgetPassword), loginServices.validateForgetPassword)
router.patch('/reset-password', validation(validators.resetPassword), loginServices.resetPassword)


export default router