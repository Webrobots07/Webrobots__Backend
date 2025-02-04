import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: {
    type: "String",
    minLength: [2, "Name must contain atleast 2 character"],
    maxLenght: [32, "Name must not contain more than 32 character"],
  },
  email:{
    type: String,
    required: [true, "User must enter email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,4}$/, "Invalid email format"],
  },
  contact:{
    type:Number,
    required:[true,"User must enter contact"],
  },
  age:{
    type:String,
    required:[true,"User must enter age"],
  },
  gender:{
    type:String,
    required:[true,"User must enter Gender"]
  },
  about:{
    type:String,
    required:[true,"User must give personal information"]
  },
  password:{
    type:String,
    required:[true,"User must give password"]
  }
   
});


const Profile=new mongoose.model("Profile",User)

export default Profile;