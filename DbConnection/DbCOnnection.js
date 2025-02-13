import mongoose from "mongoose";

export const dbConnection=async()=>{
    try {
       await mongoose.connect(process.env.MONGO_DB).then(()=>{
            console.log("Database is Connected")
        })
    } catch (error) {
        console.log(error)
    }
}