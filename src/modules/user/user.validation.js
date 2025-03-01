import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);


export const updateUser = joi.object().keys({
    mobileNumber: generalFields.phone.required(),
    DOB: joi.date()
    .less(eighteenYearsAgo) // Ensures the date is at least 18 years ago
    .required()
    .messages({
        'date.less': 'You must be at least 18 years old.',
        'any.required': 'Date of birth is required.'
    }),
    firstName: generalFields.username.required(),
    lastName: generalFields.username.required(),
    gender: generalFields.gender.required()
}).required()


export const profileImage = joi.object().keys({
    file: generalFields.file.required()
}).required()


export const viewUser = joi.object().keys({
    userId: generalFields.id.required()
}).required()