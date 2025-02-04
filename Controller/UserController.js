import Profile from "../Model/UserModel.js";
import bcrypt from "bcrypt"
import { GoogleGenerativeAI } from "@google/generative-ai";

export const Register=async(req,res,next)=>{
    try {
        const {name,email,contact,age,gender,about,address,password}=req.body;
   
    if(!name || !email || !contact || !age || !gender || !about || !address || !password )
    {
        return res.status(400).json({message:"Please fill full details"})
    }
    const isUserExist=await Profile.findOne({email})
    if(isUserExist)
    {
        return res.status(400).json({message:"User Already Exist"})
    }
    const hashedPassword=await bcrypt.hash(password,10)

    const newUser=new Profile({
        name,email,contact,age,gender,about,address,password:hashedPassword
    })

    await newUser.save();
    res.status(201).json({success: true,message:"User Registered Succesfully ",newUser})
    } catch (error) {
        console.error("Error in registring the User",error)
        res.status(500).json({message:"Internal Server Error"})
    }

}

const genAI = new GoogleGenerativeAI("AIzaSyBhlhAESKZxa6faWnSxEhwMd62-Hn6AwzQ");

export const generateQueryAnswer = async (req, res) => {
    try {
        const { query,queryType } = req.body;
        if(queryType==="")
        {
            queryType="medium"
        }
        if(query==="")
        {
           return res.status(400).json({message:"EmptyQuery"})
        }
        const prompt = `Write a ${queryType} job description and bold heading:
        ${query}`

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ success: true, summary: response });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ success: false, message: "AI service failed" });
    }
};

