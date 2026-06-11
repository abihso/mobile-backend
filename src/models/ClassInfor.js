import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    fees : {
        type : mongoose.Schema.Types.Number,
        required : true
    },
    code : {
        type : String,
        required : true,
        trim : true,
        unique : true
    }
},{
    timestamps : true
})

const classModel = mongoose.model("ClassInfor",classSchema)

export default classModel
