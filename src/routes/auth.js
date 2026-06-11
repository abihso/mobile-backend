import { json, Router } from "express";
import { changePasswordValidationSchema, classInforValidationSchema, logginValidationSchema, userValidationSchema } from "../utils/validations.js";
import logger from "../utils/logger.js";
import studentModel from "../models/StudentModel.js";
import { hassPassword, verifyPassword } from "../utils/utils.js";
import { generateToken, verifyToken } from "../utils/generateToken.js";
import teacherModel from "../models/TeacherModel.js";
import userModel from "../models/OtherUser.js";

const authRoute = Router()

authRoute.post("/login-student",async (req,res) => {
    const {error} = logginValidationSchema.validate(req.body)
    if(error){
        logger.log("error",`user tried to log in at ${new Date().toISOString()}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : "Failed to log in"
        })
    }

    const student = await studentModel.findOne({admissionNumber : req.body.pin})
    if(!student){
        logger.log("error",`user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`
        })
    }
    if(!await verifyPassword(req.body.password,student.password)){
        logger.log("error",`user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`
        })
    }
    const token = generateToken(student._id)
    console.log(student.classInfor)
    return res.status(200).json({
        success : true,
        message : "Loggin successful",
        token,
        id : student._id,
        name : `${student.firstName}`,
        gender : student.gender,
        classInfor : student.classInfor,
    })

})
authRoute.post("/login-teacher",async (req,res) => {
    const {error} = logginValidationSchema.validate(req.body)
    if(error){
        logger.log("error",`user tried to log in at ${new Date().toISOString()}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : "Failed to log in"
        })
    }

    const teacher = await teacherModel.findOne({staffId : req.body.pin})
    if(!teacher){
        logger.log("error",`a teacher tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `a teacher tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`
        })
    }
    if(!await verifyPassword(req.body.password,teacher.password)){
        logger.log("error",`a teacher tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `a teacher tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`
        })
    }
    const token = generateToken(teacher._id)
    return res.status(200).json({
        success : true,
        message : "Loggin successful",
        token,
        id : teacher._id,
        name : `${teacher.firstName}`,
        gender : teacher.gender
    })

})
authRoute.post("/verify-status", (req,res) => {
   try {
    verifyToken(req.body.token) 
     
   } catch (error) {
        logger.log("error",`failed to verify user ${new Date().toISOString()}`)
         return res.status(404).json({
             success : false,
             message : "failed to verify user"
         }) 
   }
    
    return res.status(200).json({
        success : true,
        message : "user verify successfully"
    })
})
authRoute.post("/change-password",async (req,res) => {
    const {error} = changePasswordValidationSchema.validate(req.body)
    if(error){
        console.log(error)
        logger.log("error",`user tried to change password at ${new Date().toISOString()} but failed to validate user`)
        return res.status(404).json({
            success : false,
            message : "failed to validate data, please provide the right infor"
        })
    }
     
    const {id,newPassword,oldPassword,comfirmPassword,role} = req.body
    if(newPassword !== comfirmPassword) {
        return res.status(404).json({
            success : false,
            message : "comfirm password must be equal to new password"
        })
    }
    let user = null
    if(role == "teacher"){
       try {
         user = await teacherModel.findById(id)
       } catch (error) {
        logger.log("error",`user tried to change password at ${new Date().toISOString()} but having issue with the database ::id:${id}`)
        return res.status(404).json({
            success : false,
            message : "Failed to change password"
        })
       }
    }else if(role == "student"){
         try {
         user = await studentModel.findById(id)
       } catch (error) {
        logger.log("error",`user tried to change password at ${new Date().toISOString()} but having issue with the database ::id:${id}`)
        return res.status(404).json({
            success : false,
            message : "Failed to change password"
        })
       }
        
    }else{
        logger.log("error",`user tried to change password at ${new Date().toISOString()} but failed to validate user with id:${id}`)
        return res.status(404).json({
            success : false,
            message : "Failed to change password"
        })
    }
    if(!user){
        logger.log("error",`user tried to change password at ${new Date().toISOString()} but failed to get user with id:${id}`)
        return res.status(404).json({
            success : false,
            message : "failed to fetch user"
        })
    }

    if(!await verifyPassword(oldPassword,user.password)){
        logger.log("error",`user tried to change password at ${new Date().toISOString()} with wrong credentials id:${id}`)
        return res.status(404).json({
            success : false,
            message : "Wrong credentials"
        })
    }

    try {
        await user.updateOne({password : await hassPassword(newPassword) })
    } catch (error) {
         return res.status(404).json({
            success : false,
            message : "failed to update password"
        })
    }

    return res.status(200).json({
        success : true,
        message : "Password changed successfully"
    })
})
authRoute.post("/students/classinfor",async (req,res) => {
    let students = null
    const {error} = classInforValidationSchema.validate(req.body)
    if(error){
        logger.log("error",`failed to validate class infor at ${req.url} Time:: ${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : "failed to validate classInfor"
        })
    }
    try { 
        students = await studentModel.find({classInfor : req.body.classInfor}).select("-password")
        if(!students) throw new Error("No students found")

       return res.status(200).json({
            success : true,
            data : students
    })
    } catch (error) {
        logger.log("error",`${error.message} at ${req.url} Time:: ${new Date().toISOString()}`)
        return res.status(404).json({
            success : false,
            message : error
        })
    }
})
authRoute.post("/login-user",async (req,res) => {
     const {error} = logginValidationSchema.validate(req.body)
    if(error){
        logger.log("error",`user tried to log in at ${new Date().toISOString()}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : "Failed to log in"
        })
    }

    const user = await userModel.findOne({id : req.body.pin})
    if(!user){
        logger.log("error",`user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin}`
        })
    }
    if(!await verifyPassword(req.body.password,user.password)){
        logger.log("error",`user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`)
        console.log(error)
        return res.status(404).json({
            success : false,
            message : `user tried to log in at ${new Date().toISOString()} with id: ${req.body.pin} and password: ${req.body.password}`
        })
    }
    const token = generateToken(user._id)

    return res.status(200).json({
        success : true,
        message : "Loggin successful",
        token,
        id : user._id,
        role : user.role
    })
})

export default authRoute   