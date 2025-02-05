import Profile from "../Model/UserModel.js";
// import bcrypt from "bcrypt"
import { GoogleGenerativeAI } from "@google/generative-ai";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js"; // Use legacy build
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";


import Tesseract from "tesseract.js";
// import Summary from "../Model/Summary.js";

// export const Register=async(req,res,next)=>{
//     try {
//         const {name,email,contact,age,gender,about,address,password}=req.body;
   
//     if(!name || !email || !contact || !age || !gender || !about || !address || !password )
//     {
//         return res.status(400).json({message:"Please fill full details"})
//     }
//     const isUserExist=await Profile.findOne({email})
//     if(isUserExist)
//     {
//         return res.status(400).json({message:"User Already Exist"})
//     }
//     const hashedPassword=await bcrypt.hash(password,10)

//     const newUser=new Profile({
//         name,email,contact,age,gender,about,address,password:hashedPassword
//     })

//     await newUser.save();
//     res.status(201).json({success: true,message:"User Registered Succesfully ",newUser})
//     } catch (error) {
//         console.error("Error in registring the User",error)
//         res.status(500).json({message:"Internal Server Error"})
//     }

// }

const genAI = new GoogleGenerativeAI("AIzaSyBhlhAESKZxa6faWnSxEhwMd62-Hn6AwzQ");

export const generateQueryAnswer = async (req, res) => {
    try {
        const { query,queryType } = req.body;
        if(query==="")
        {
           return res.status(400).json({message:"EmptyQuery"})
        }
        const prompt = `Write a ${queryType} job description and bold heading:
        ${query}`

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        // const newSummary = new Summary({
        //    summary:response
        // });

        // await newSummary.save();
        // res.status(201).json({success:true, message: "Summary Generated", summary: response});
        res.json({ success: true, summary: response });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ success: false, message: "AI service failed" });
    }
};

// export const summarizeCV = async (req, res) => {
//     try {
//       const file = req.file;
//       let extractedText = '';
  
//       if (!file) {
//         return res.status(400).json({ error: 'No file uploaded.' });
//       }
  
//       if (file.mimetype === 'application/pdf') {
//         const data = await pdfParse(file.buffer); 
//         extractedText = data.text;
  
//       } else if (file.mimetype.startsWith('image/')) {
//         const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
//         extractedText = text;
  
//       } else {
//         return res.status(400).json({ error: 'Unsupported file format.' });
//       }
  
//       const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//       const result = await model.generateContent(`Summarize this CV:\n${extractedText}`);
//       const summary = await result.response.text();
  
//       res.json({ summary });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Failed to process the file.' });
//     }
//   };


const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    let textContent = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const textItems = content.items.map(item => item.str).join(' ');
      textContent += textItems + '\n';
    }

    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

export default extractTextFromPDF;



  
  export const summarizeCV = async (req, res) => {
    try {
      const file = req.file;
      let extractedText = '';
  
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
  
      if (file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPDF(file.buffer);
      }else if (file.mimetype.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
        extractedText = text;
      } else {
        return res.status(400).json({ error: 'Unsupported file format.' });
      }
  
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(`Summarize this CV in 500 words:\n${extractedText}`);
      const summary = await result.response.text();
  
      res.json({ summary });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to process the file.' });
    }
  };