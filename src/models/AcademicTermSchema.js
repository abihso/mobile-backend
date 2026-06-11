// AcademicTermModel.js (optional but useful)
import mongoose from "mongoose";

const academicTermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        enum: ['First Term', 'Second Term', 'Third Term']
    },
    academicYear: {
        type: String,
        required: true,
        match: /^\d{4}-\d{4}$/
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    // Date when marks can be entered/edited by teachers
    marksEntryStartDate: {
        type: Date,
        required: true
    },
    marksEntryEndDate: {
        type: Date,
        required: true
    },
    // Date when marks become visible to students
    marksPublicationDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Ensure only one active term per academic year
academicTermSchema.index({ academicYear: 1, term: 1 }, { unique: true });

const AcademicTerm = mongoose.model("AcademicTerm", academicTermSchema);
export default AcademicTerm;