import mongoose from "mongoose";

const markSchema = new mongoose.Schema({
    // Reference to the student
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        ref: "Student"
    },
    
    // Reference to the teacher
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
        ref : "Teacher"
    },
    
    // Subject name 
    subject: {
        type: String,
        required: true,
        trim: true
    },
    
    // Class information
    classInfor: {
        type: String,
        required: true
    },
    
    // Academic term
    term: {
        type: String,
        required: true,
        enum: ['First Term', 'Second Term', 'Third Term'],
        // lowercase: true
    },
    
    // Academic year (e.g., "2024-2025")
    academicYear: {
        type: String, 
        required: true,
        match: /^\d{4}-\d{4}$/
    },
    
    // Marks breakdown
    marks: {
        // Continuous Assessment (30%)
        ca: {
            type: Number,
            required: true,
            min: 0,
            max: 30
        },
        
        // Examination (70%)
        exam: {
            type: Number,
            required: true,
            min: 0,
            max: 70
        },
        
        // Total marks (calculated automatically)
        total: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    
    // Grade and remarks
    grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    
    remarks: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor', 'Fail']
    },
    
    // Position in class (optional, can be calculated)
    position: {
        type: Number,
        min: 1
    },
    
    // Additional notes from teacher
    teacherNotes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Status (e.g., published, draft)
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    
    // Who last modified the marks
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    }
    
}, { 
    timestamps: true 
});

// Compound index to ensure a student has only one mark per subject per term per academic year
markSchema.index(
    { 
        studentId: 1, 
        subject: 1, 
        term: 1, 
        academicYear: 1,
        classInfor: 1 
    }, 
    { unique: true }
);

// Index for efficient queries
markSchema.index({ teacherId: 1, classInfor: 1, subject: 1, term: 1, academicYear: 1 });
markSchema.index({ studentId: 1, academicYear: 1, term: 1 });

// Pre-save middleware to calculate total marks, grade, and remarks
markSchema.pre('save', function(next) {
    // Calculate total marks
    this.marks.total = this.marks.ca + this.marks.exam;
    
    // Validate total (already enforced by min/max but double-check)
    if (this.marks.total < 0 || this.marks.total > 100) {
        return next(new Error('Total marks must be between 0 and 100'));
    }
    
    // Determine grade and remarks based on total marks
    const total = this.marks.total;
     
    if (total >= 80) {
        this.grade = 'A';
        this.remarks = 'Excellent';
    } else if (total >= 70) {
        this.grade = 'B';
        this.remarks = 'Very Good';
    } else if (total >= 60) {
        this.grade = 'C';
        this.remarks = 'Good';
    } else if (total >= 50) {
        this.grade = 'D';
        this.remarks = 'Fair';
    } else if (total >= 40) {
        this.grade = 'E';
        this.remarks = 'Poor';
    } else {
        this.grade = 'F';
        this.remarks = 'Fail';
    }
    
    next;
});

// Static method to get all marks for a student in a specific term
markSchema.statics.getStudentTermMarks = async function(studentId, term, academicYear) {
    return await this.find({
        studentId,
        term,
        academicYear,
        status: 'published'
    }).populate('subject', 'name code');
};

// Static method to get class performance for a subject in a term
markSchema.statics.getClassSubjectPerformance = async function(classInfor, subject, term, academicYear) {
    const marks = await this.find({
        classInfor,
        subject,
        term,
        academicYear,
        status: 'published'
    }).populate('studentId', 'firstName lastName admissionNumber');
    
    // Calculate statistics
    if (marks.length === 0) return null;
    
    const totals = marks.map(m => m.marks.total);
    const average = totals.reduce((a, b) => a + b, 0) / totals.length;
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    const passCount = marks.filter(m => m.marks.total >= 40).length;
    const failCount = marks.filter(m => m.marks.total < 40).length;
    
    return {
        marks,
        statistics: {
            average: average.toFixed(2),
            highest,
            lowest,
            passCount,
            failCount,
            totalStudents: marks.length,
            passPercentage: ((passCount / marks.length) * 100).toFixed(2)
        }
    };
};

// Static method to get student's performance across terms
markSchema.statics.getStudentYearlyPerformance = async function(studentId, academicYear) {
    const terms = ['First Term', 'Second Term', 'Third Term'];
    const performance = {};
    
    for (const term of terms) {
        const marks = await this.find({
            studentId,
            term,
            academicYear,
            status: 'published'
        }).sort('subject');
        
        if (marks.length > 0) {
            const totalScore = marks.reduce((sum, mark) => sum + mark.marks.total, 0);
            const averageScore = totalScore / marks.length;
            
            performance[term] = {
                marks,
                totalScore,
                averageScore: averageScore.toFixed(2),
                subjectsCount: marks.length
            };
        }
    }
    
    return performance;
};

// Instance method to update marks
markSchema.methods.updateMarks = async function(ca, exam, teacherId) {
    this.marks.ca = ca;
    this.marks.exam = exam;
    this.lastModifiedBy = teacherId;
    this.status = 'draft'; // Reset to draft after update
    await this.save();
    return this;
};

// Instance method to publish marks
markSchema.methods.publish = async function() {
    this.status = 'published';
    await this.save();
    return this;
};

const MarkModel = mongoose.model("Mark", markSchema);

export default MarkModel;