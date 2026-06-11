import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    code : {
        type : String,
        required : true,
        trim : true
    }
},{
    timestamps : true
})

const subjectModel = mongoose.model("SubjectInfor",subjectSchema)

export default subjectModel
