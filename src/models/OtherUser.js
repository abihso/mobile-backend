import mongoose, { mongo } from "mongoose";

// User-specific counter schema
const userCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 4000000000 }
});

const userCounter = mongoose.model("UserCounter", userCounterSchema);

const userSchema = new mongoose.Schema({
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
    password : {
        type : String,
        required : true,
        min : 6
    },
    role : {
        type : String,
        required : true,
        enum : ["Admin","Registrar"]        
    },
       id: {
        type: String,
        unique: true,
        trim: true
    }
},{
    timestamps : true
})
userSchema.pre('save', async function() {
    if (!this.id) {
        const counter = await userCounter.findByIdAndUpdate(
            "userId",
            { $inc: { sequence_value: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        
        const prefix = "STU";
        const suffix = "STAFF";
        const numberPart = String(counter.sequence_value).padStart(10, '0');
        this.id = `${prefix}-${numberPart}-${suffix}`;
    }
});
const userModel = mongoose.model("User", userSchema)

export default userModel