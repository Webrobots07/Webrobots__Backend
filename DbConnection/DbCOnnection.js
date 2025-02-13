import mongoose from "mongoose";

export const dbConnection=async()=>{
    try {
       await mongoose.connect("mongodb+srv://webrobots:webrobots@cluster0.6zkrd.mongodb.net/?retryWrites=true&w=majority").then(()=>{
            console.log("Database is Connected")
        })
    } catch (error) {
        console.log(error)
    }
}