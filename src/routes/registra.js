import { Router } from "express";
import { classInforValidationSchema2, subjectValidationSchema, userValidationSchema } from "../utils/validations.js";
import logger from "../utils/logger.js";
import classModel from "../models/ClassInfor.js";
import subjectModel from "../models/Subject.js";
import userModel from "../models/OtherUser.js";
import { hassPassword } from "../utils/utils.js";

const registraRoute = Router()

registraRoute.post("/register-user",async (req,res) => {
    const {error} = userValidationSchema.validate(req.body)
    if(error) {
        logger.error(`infor::${JSON.stringify(error.details[0])}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.details[0])
        })
    }
    try {
        req.body.password = await hassPassword(req.body.password)
        const createUser = await userModel.create(req.body)

        await createUser.save()
        return res.status(200).json({
            success : true,
            message : "user saved successfully"
        })
    } catch (error) {
        logger.error(`infor::${JSON.stringify(error.message)}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.message)
        })
    }
})
registraRoute.post("/register-class",async (req,res) => {
    const {error} = classInforValidationSchema2.validate(req.body)
    if(error) {
        logger.error(`infor::${JSON.stringify(error.details[0])}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.details[0])
        })
    }

    try {
        const createClass = await classModel.create(req.body)
        await createClass.save()
        return res.status(200).json({
            success : true,
            message : "class created successfully"
        })
    } catch (error) {
        console.log(error)
        logger.error(`infor::${JSON.stringify(error.message)}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.message)
        })
    }
})
registraRoute.get("/get-classess", async(req,res) => {
    try {
        const data = await classModel.find()
        if(!data) throw new Error("No classess found yet")
        return res.status(200).json({
            success : true,
            data
    })
    } catch (error) {
        logger.error(`infor::${JSON.stringify(error.message)}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.message)
        })
    }

})
registraRoute.get("/get-subjects", async(req,res) => {
    try {
        const data = await subjectModel.find()
        if(!data) throw new Error("No subjects found yet")
        return res.status(200).json({
            success : true,
            data
    })
    } catch (error) {
        logger.error(`infor::${JSON.stringify(error.message)}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.message)
        })
    }

})
registraRoute.post("/add-subject",async (req,res) => {
    const {error} = subjectValidationSchema.validate(req.body)
    if(error) {
        logger.error(`infor::${JSON.stringify(error.details[0])}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.details[0])
        })
    }
    try {
        const createSubject = await subjectModel.create(req.body)
        await createSubject.save()
        return res.status(200).json({
            success : true,
            message : "subject saved successfully"
        })
    } catch (error) {
        logger.error(`infor::${JSON.stringify(error.message)}-time::${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : JSON.stringify(error.message)
        })
    }
})


export default registraRoute