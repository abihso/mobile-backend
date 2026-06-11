import { Router } from "express";
import { teacherRegistrationValidationSchema } from "../utils/validations.js";
import logger from "../utils/logger.js";
import { hassPassword } from "../utils/utils.js";
import teacherModel from "../models/TeacherModel.js";
import studentModel from "../models/StudentModel.js";
import MarkModel from "../models/MarksModel.js";
const teacherRoute = Router()

teacherRoute.post("/",async (req,res) => {
    const {error} = teacherRegistrationValidationSchema.validate(req.body)

    if (error) {
        let reason = error.details         
        logger.error(`infor::failed to register teacher- reasons::${JSON.stringify(reason)}-time::${new Date().toISOString()}`)
        return res.status(404).json({success : false, message : `failed to register teacher-reasons::${JSON.stringify(reason)}`})
    } 
    try {
        const createTeacher = new teacherModel(
            {
                firstName : req.body.firstName,
                middleName : req.body.middleName, 
                lastName : req.body.lastName,
                date : req.body.date,
                password : await hassPassword(req.body.password),
                subject : req.body.subject || [],
                classInfor : req.body.classInfor || [] ,
                gender : req.body.gender
            }
            )
            await createTeacher.save()
    } catch (error) {
        console.log(error)
        logger.error(`infor::Failed to save teacher record into database-reasons::${JSON.stringify(error.errorResponse)} time::${new Date().toISOString()}`)
        return res.status(404).json({success : false, message : "Failed to save teacher record into database"})
    }

    return res.status(201).json({success : true, message : "process successful"})

})



// @desc    Enter marks for a single student
teacherRoute.post('/enter', async (req, res) => {
    try {
        const {
            studentId,
            subject,
            classInfor,
            term,
            academicYear,
            ca,
            exam,
            teacherNotes,
            teacherId
        } = req.body;


        // Validate required fields
        if (!studentId || !subject || !classInfor || !term || !academicYear || ca === undefined || exam === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: studentId, subject, classInfor, term, academicYear, ca, exam'
            });
        }

        // Validate CA and Exam marks
        if (ca < 0 || ca > 30) {
            return res.status(400).json({
                success: false,
                message: 'CA marks must be between 0 and 30'
            });
        }

        if (exam < 0 || exam > 70) {
            return res.status(400).json({
                success: false,
                message: 'Exam marks must be between 0 and 70'
            });
        }

        // Verify teacher teaches this subject and class
        const teacher = await teacherModel.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        if (!teacher.subject.includes(subject) || !teacher.classInfor.includes(classInfor)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to enter marks for this subject or class'
            });
        }

        // Verify student exists and is in the specified class
        const student = await studentModel.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        if (student.classInfor !== classInfor) {
            return res.status(400).json({
                success: false,
                message: `Student is not in class ${classInfor}`
            });
        }

        // Check if marks already exist
        let mark = await MarkModel.findOne({
            studentId,
            subject,
            term,
            academicYear,
            classInfor
        });

        if (mark) {
            // Update existing marks
            mark.marks.ca = ca;
            mark.marks.exam = exam;
            mark.teacherNotes = teacherNotes || mark.teacherNotes;
            mark.lastModifiedBy = teacherId;
            mark.status = 'draft';
            await mark.save();

            return res.status(200).json({
                success: true,
                message: 'Marks updated successfully',
                data: mark
            });
        } else {
            // Create new marks
            mark = new MarkModel({
                studentId,
                teacherId,
                subject,
                classInfor,
                term,
                academicYear,
                marks: { ca, exam },
                teacherNotes,
                lastModifiedBy: teacherId
            });
            await mark.save();

            return res.status(201).json({
                success: true,
                message: 'Marks entered successfully',
                data: mark
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @desc    Enter marks for multiple students in a class
// teacherRoute.post('/enter-batch', async (req, res) => {
//     try {
//         const {
//             subject,
//             classInfor,
//             term,
//             academicYear,
//             students  // Array of { studentId, ca, exam, teacherNotes? }
//         } = req.body;

//         const teacherId = req.user._id;

//         // Validate required fields
//         if (!subject || !classInfor || !term || !academicYear || !students || !students.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide subject, classInfor, term, academicYear, and students array'
//             });
//         }

//         // Verify teacher teaches this subject and class
//         const teacher = await TeacherModel.findById(teacherId);
//         if (!teacher) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Teacher not found'
//             });
//         }

//         if (!teacher.subject.includes(subject) || !teacher.classInfor.includes(classInfor)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You are not authorized to enter marks for this subject or class'
//             });
//         }

//         const results = {
//             successful: [],
//             failed: []
//         };

//         // Process each student
//         for (const studentData of students) {
//             try {
//                 const { studentId, ca, exam, teacherNotes } = studentData;

//                 // Validate marks range
//                 if (ca < 0 || ca > 30 || exam < 0 || exam > 70) {
//                     results.failed.push({
//                         studentId,
//                         reason: 'Invalid marks range (CA: 0-30, Exam: 0-70)'
//                     });
//                     continue;
//                 }

//                 // Verify student exists and is in correct class
//                 const student = await StudentModel.findById(studentId);
//                 if (!student) {
//                     results.failed.push({
//                         studentId,
//                         reason: 'Student not found'
//                     });
//                     continue;
//                 }

//                 if (student.classInfor !== classInfor) {
//                     results.failed.push({
//                         studentId,
//                         reason: `Student is not in class ${classInfor}`
//                     });
//                     continue;
//                 }

//                 // Check if marks already exist
//                 let mark = await MarkModel.findOne({
//                     studentId,
//                     subject,
//                     term,
//                     academicYear,
//                     classInfor
//                 });

//                 if (mark) {
//                     // Update existing marks
//                     mark.marks.ca = ca;
//                     mark.marks.exam = exam;
//                     mark.teacherNotes = teacherNotes || mark.teacherNotes;
//                     mark.lastModifiedBy = teacherId;
//                     mark.status = 'draft';
//                     await mark.save();
//                 } else {
//                     // Create new marks
//                     mark = new MarkModel({
//                         studentId,
//                         teacherId,
//                         subject,
//                         classInfor,
//                         term,
//                         academicYear,
//                         marks: { ca, exam },
//                         teacherNotes,
//                         lastModifiedBy: teacherId
//                     });
//                     await mark.save();
//                 }

//                 results.successful.push({
//                     studentId,
//                     studentName: `${student.firstName} ${student.lastName}`,
//                     total: mark.marks.total,
//                     grade: mark.grade
//                 });
//             } catch (error) {
//                 results.failed.push({
//                     studentId: studentData.studentId,
//                     reason: error.message
//                 });
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Successfully processed ${results.successful.length} out of ${students.length} students`,
//             data: results
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// });

// @desc    Get all marks for a class for a specific subject and term (for teacher to view/edit)
teacherRoute.get('/class/:classInfor/:subject/:term/:academicYear/:teacherId', async (req, res) => {
    try {
        const { classInfor, subject, term, academicYear, teacherId } = req.params;

        // Verify teacher teaches this subject and class
        const teacher = await TeacherModel.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        if (!teacher.subject.includes(subject) || !teacher.classInfor.includes(classInfor)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view marks for this subject or class'
            });
        }

        // Get all students in the class
        const students = await StudentModel.find({ classInfor })
            .select('firstName lastName middleName admissionNumber')
            .sort('lastName');

        // Get marks for these students
        const marks = await MarkModel.find({
            classInfor,
            subject,
            term,
            academicYear
        }).populate('studentId', 'firstName lastName middleName admissionNumber');

        // Create a map for quick lookup
        const marksMap = new Map();
        marks.forEach(mark => {
            marksMap.set(mark.studentId._id.toString(), mark);
        });

        // Combine student info with their marks
        const classMarks = students.map(student => {
            const mark = marksMap.get(student._id.toString());
            return {
                studentId: student._id,
                admissionNumber: student.admissionNumber,
                studentName: `${student.firstName} ${student.lastName}`,
                ca: mark ? mark.marks.ca : null,
                exam: mark ? mark.marks.exam : null,
                total: mark ? mark.marks.total : null,
                grade: mark ? mark.grade : null,
                remarks: mark ? mark.remarks : null,
                status: mark ? mark.status : 'not_entered',
                markId: mark ? mark._id : null
            };
        });

        res.status(200).json({
            success: true,
            count: classMarks.length,
            data: {
                classInfor,
                subject,
                term,
                academicYear,
                students: classMarks
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @desc    Publish all marks for a class subject and term 
teacherRoute.put('/publish/:classInfor/:subject/:term/:academicYear', async (req, res) => {
    try {
        const { classInfor, subject, term, academicYear } = req.params;
        const teacherId = req.user._id;

        // Verify teacher teaches this subject and class
        const teacher = await TeacherModel.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        if (!teacher.subject.includes(subject) || !teacher.classInfor.includes(classInfor)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to publish marks for this subject or class'
            });
        }

        // Update all marks to published status
        const result = await MarkModel.updateMany(
            {
                classInfor,
                subject,
                term,
                academicYear,
                status: 'draft'
            },
            {
                status: 'published',
                lastModifiedBy: teacherId
            }
        );

        res.status(200).json({
            success: true,
            message: `Published ${result.modifiedCount} marks successfully`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @desc    Get all classes and subjects taught by the teacher
teacherRoute.get('/teacher/my-classes', async (req, res) => {
    try {
        const teacher = await TeacherModel.findById(req.user._id)
            .select('firstName lastName subject classInfor');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                teacherName: `${teacher.firstName} ${teacher.lastName}`,
                subjects: teacher.subject,
                classes: teacher.classInfor
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @desc    Get marks for a specific student (for teacher to view)
teacherRoute.get('/student/:studentId/:term/:academicYear', async (req, res) => {
    try {
        const { studentId, term, academicYear } = req.params;

        const marks = await MarkModel.find({
            studentId,
            term,
            academicYear,
            status: 'published'
        }).populate('teacherId', 'firstName lastName');

        if (!marks || marks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No marks found for this student'
            });
        }

        res.status(200).json({
            success: true,
            count: marks.length,
            data: marks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});



export default teacherRoute

     