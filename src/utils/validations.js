import Joi from "joi";

export const studentRegistrationValidationSchema = Joi.object({
        admissionNumber : Joi.allow("") ,
        firstName : Joi.string().required().min(2),
        lastName : Joi.string().required().min(2),
        middleName : Joi.string().allow(""),
        date : Joi.date().required(),
        password : Joi.string().required().min(6),
        classInfor : Joi.string().required().disallow("")
    })
export const teacherRegistrationValidationSchema = Joi.object({
        staffId : Joi.allow(""),
        firstName : Joi.string().required(),
        gender : Joi.string().required(),
        lastName : Joi.string().required(),
        middleName : Joi.string().allow(""),
        date : Joi.date().required(), 
        password : Joi.string().required().min(6),
        subject : Joi.array().required(),
        classInfor : Joi.array().required(),
    })
export const logginValidationSchema = Joi.object({
        pin : Joi.string().required(),
        password : Joi.string().required().min(6),
        role : Joi.string().required().min(4)
    })
export const changePasswordValidationSchema = Joi.object({
        newPassword : Joi.string().required().min(6),
        comfirmPassword : Joi.string().required().min(6),
        id : Joi.string().required(),
        oldPassword : Joi.string().required().min(6),
        role : Joi.string().required(),
    })
export const classInforValidationSchema = Joi.object({
        classInfor : Joi.string().required(),
    })
export const classInforValidationSchema2 = Joi.object({
        name : Joi.string().required(),
        fees : Joi.number().required().min(1),
        code : Joi.string().min(2).required()
    })
export const subjectValidationSchema = Joi.object({
        name : Joi.string().required(),
        code : Joi.string().min(2).required()
    })

export const userValidationSchema = Joi.object({
    firstName : Joi.string().required(),
    lastName : Joi.string().required(),
    middleName : Joi.string().allow(),
    role : Joi.string().required(),
    password : Joi.string().required().min(6),
})

