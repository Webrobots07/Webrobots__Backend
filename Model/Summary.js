import mongoose from "mongoose";

const summary=new mongoose.Schema({
    summary:{
        type:String
    }
})
const Summary=new mongoose.model("Summary",summary)

export default Summary;