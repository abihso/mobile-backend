import bcrypt from "bcrypt"

export const hassPassword = async (password) => await bcrypt.hash(password,await bcrypt.genSalt(10))

export const verifyPassword = async (myPlaintextPassword, hash) => await bcrypt.compare(myPlaintextPassword, hash)


