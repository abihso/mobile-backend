import mongoose from "mongoose";

const connectDb = async () => {
    mongoose.connect(process.env.DB,{autoIndex : true}).then(() => console.log("Connected")).catch(err => console.log(err))
}

export default connectDb