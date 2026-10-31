import express from "express";
import { configDotenv } from "dotenv";
import logger from "./utils/logger.js";
import connectDb from "./config/db.js";
import studentRoute from "./routes/student.js";
import cors  from "cors"
import teacherRoute from "./routes/teacher.js";
import authRoute from "./routes/auth.js";
import registraRoute from "./routes/registra.js";
configDotenv()
connectDb()

const server = express()
const PORT = process.env.PORT || 4000
server.use(cors("*"))
server.use(express.json()) 
server.use(express.urlencoded({extended : true}))
server.use("/api/v1/student-registration",studentRoute)
server.use("/api/v1/auth",authRoute) 
server.use("/api/v1/teacher-registration",teacherRoute)
server.use("/api/v1/registrar",registraRoute)
server.get("/",(req,res) => {
    logger.log({level : "error", message : "inside the home route"})
    return res.json( {
        name : "Solomon pwatiu", 
        age : 30
    })
})
server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`),)