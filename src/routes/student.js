import { Router } from "express";
import { studentRegistrationValidationSchema } from "../utils/validations.js";
import logger from "../utils/logger.js";
import studentModel from "../models/StudentModel.js";
import { hassPassword } from "../utils/utils.js";
import MarkModel from "../models/MarksModel.js";
import mongoose from 'mongoose';

const studentRoute = Router()

studentRoute.post("/",async (req,res) => {
    const {error} = studentRegistrationValidationSchema.validate(req.body)
    if (error) {
        let reason = error.details         
        logger.error(`infor::failed to register student- reasons::${JSON.stringify(reason)}-time::${new Date().toISOString()}`)
        return res.status(404).json({success : false, message : `failed to register student-reasons::${JSON.stringify(reason)}`})
    } 
    try {
        const createStudent = new studentModel(
            {
                firstName : req.body.firstName,
                middleName : req.body.middleName, 
                lastName : req.body.lastName,
                date : req.body.date,
                classInfor : req.body.classInfor,
                password : await hassPassword(req.body.password),
                gender : req.body.gender
            }
            )
            await createStudent.save()
    } catch (error) {
        console.log(error.errorResponse)
        logger.error(`infor::Failed to save student record into database-reasons::${JSON.stringify(error.errorResponse)} time::${new Date().toISOString()}`)
        return res.status(404).json({success : false, message : "Failed to save student record into database",error})
    }

    return res.status(201).json({success : true, message : "process successful"})

})


studentRoute.get("/marks/students/:id", async (req, res) => {
  try {
    const results = await MarkModel.aggregate([
      {
        $match: { studentId: new mongoose.Types.ObjectId(req.params.id), status:"published" }
      },
      {
        $group: {
          _id: {
            academicYear: "$academicYear",
            term: "$term"
          },
          marks: {
            $push: {
              subject: "$subject",
              classInfor: "$classInfor",
              ca: "$marks.ca",
              exam: "$marks.exam", 
              total: "$marks.total",
              grade: "$grade",
              remarks: "$remarks",
              teacherNotes: "$teacherNotes",
              status: "$status",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          "_id.academicYear": -1,
          "_id.term": 1  // Sort terms in ascending order (First Term comes first)
        }
      },
      {
        $group: {
          _id: "$_id.academicYear",
          terms: {
            $push: {
              term: "$_id.term",
              marks: "$marks",
              count: "$count"
            }
          },
          totalMarks: { $sum: "$count" }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
    
    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export default studentRoute

