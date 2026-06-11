import jwt from "jsonwebtoken"

export const generateToken = (id) => jwt.sign({id},process.env.JWT_SECRET,{expiresIn : 60 * 10 * 10})

export const verifyToken = (token) => jwt.verify(token,process.env.JWT_SECRET)