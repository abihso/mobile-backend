// StudentModel.js
import mongoose from "mongoose";

// Student-specific counter schema
const studentCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 4000000000 }
});

const StudentCounter = mongoose.model("StudentCounter", studentCounterSchema);

const studentSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        unique: true,
        trim: true
    },

    firstName : {
        type : String,
        required : true,
        trim  : true
    },
    middleName : {
        type : String,
        trim  : true
    },
    lastName : {
        type : String,
        required : true,
        trim  : true
    },
    date : {
        type : mongoose.Schema.Types.Date,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    classInfor : {
        type : String,
        required : true,
    },
     gender: {
        type: String,
        required: true,
        enum : ["male", "female"]
    }
    }, { timestamps: true });

studentSchema.pre('save', async function() {
    if (!this.admissionNumber) {
        const counter = await StudentCounter.findByIdAndUpdate(
            "studentId",
            { $inc: { sequence_value: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        
        const prefix = "STU";
        const suffix = "ST";
        const numberPart = String(counter.sequence_value).padStart(10, '0');
        this.admissionNumber = `${prefix}-${numberPart}-${suffix}`;
    }
});

const studentModel = mongoose.model("Student", studentSchema);
export default studentModel;