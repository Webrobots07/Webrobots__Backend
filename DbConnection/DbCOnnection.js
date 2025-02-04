import mongoose from "mongoose";

export const dbConnection=async()=>{
    try {
       await mongoose.connect("mongodb://localhost:27017/profile").then(()=>{
            console.log("Database is Connected")
        })
    } catch (error) {
        console.log(error)
    }
}