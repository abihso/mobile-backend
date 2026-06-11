// TeacherModel.js
import mongoose from "mongoose";

// Teacher-specific counter schema
const teacherCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 4000284568 }
});

const TeacherCounter = mongoose.model("TeacherCounter", teacherCounterSchema);

const teacherSchema = new mongoose.Schema({
    staffId: {
        type: String,
        unique: true,
        trim: true
    },
 
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: mongoose.Schema.Types.Date,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum : ["male", "female"]
    },
    subject: {
        type: mongoose.Schema.Types.Array,
        required: true,
    },
    classInfor: {
        type: mongoose.Schema.Types.Array,
        required: true,
    },
    }, { timestamps: true });

teacherSchema.pre('save', async function() {
    if (!this.staffId) {
        const counter = await TeacherCounter.findByIdAndUpdate(
            "teacherId",
            { $inc: { sequence_value: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        
        const prefix = "STU";
        const suffix = "T";
        const numberPart = String(counter.sequence_value).padStart(10, '0');
        this.staffId = `${prefix}-${numberPart}-${suffix}`;
    }
});

const teacherModel = mongoose.model("Teacher", teacherSchema);
export default teacherModel;