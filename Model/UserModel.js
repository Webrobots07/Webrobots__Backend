
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      minLength: [2, "Name must contain atleast 2 character"],
      maxLenght: [32, "Name must not contain more than 32 character"],
    },
    email: {
      type: String,
      required: [true, "User must enter email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,4}$/, "Invalid email format"],
    },
    phone:Number,
    googleId: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      // required: [true, "User must give password"],
    },

    image: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
