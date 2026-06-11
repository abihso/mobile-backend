import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true       
    },
    id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        // ref : "Teacher" || ""
    }
})

const messageModel = mongoose.model("Messages",messageSchema)

export default messageModel