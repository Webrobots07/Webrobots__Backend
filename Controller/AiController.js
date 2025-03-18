import Profile from "../Model/UserModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import fs from 'fs-extra';
import path from 'path';
import CV from "../Model/PdfModel.js"
import Tesseract from "tesseract.js";
import Summary from "../Model/Summary.js";
import { v2 as cloudinary } from "cloudinary";  // Use cloudinary.v2

cloudinary.config({
  cloud_name:"dr7vumqw0",
  api_key:"637893728592919",
  api_secret: "LMAEAR72NAKjDty8Fb7J-9dArtA",
});

// cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// API environment variable="CLOUDINARY_URL=cloudinary://632867293178936:Hrmh24PdN3GCPI749R-UUNA9jSU@dr7vumqw0"

const genAI = new GoogleGenerativeAI("AIzaSyBhlhAESKZxa6faWnSxEhwMd62-Hn6AwzQ");

// export const generateQueryAnswer = async (req, res) => {
//     try {
//         const { query,queryType } = req.body;
//         if(query==="")
//         {
//            return res.status(400).json({message:"EmptyQuery"})
//         }
//         const prompt = `Write a ${queryType} job description and bold heading:
//         ${query}`

//         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//         const result = await model.generateContent(prompt);
//         const response = result.response.text();
//         const newSummary = new Summary({
//            summary:response
//         });

//         await newSummary.save();
//         res.status(201).json({success:true, message: "Summary Generated", summary: response});
//         // res.json({ success: true, summary: response });
//     } catch (error) {
//         console.error("Error generating summary:", error);
//         res.status(500).json({ success: false, message: "AI service failed" });
//     }
// };
export const generateQueryAnswer = async (req, res) => {
  try {
    const { query, queryType,reload } = req.body;
    console.log(reload)

    if (!query) {
      return res.status(400).json({ message: "EmptyQuery" });
    }
    let prompt;
    
    // If queryType is undefined or null, generate a short description
    if (!queryType) {
      prompt = `Write a short job description and bold heading:\n${query}`;
    } else {
      prompt = `Write a ${queryType} job description with bold heading:\n${query}`;
    }

    if(reload==true)
      {
        console.log("insider")
        const prompt = `Write a ${queryType} job description and bold heading:\n${query}`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return res.status(201).json({
          success: true,
          message: "Summary Generated",
          summary: response,
        });
      }
    const existingSummary = await Summary.findOne({ query});

    if (existingSummary) {
      return res.status(200).json({
        success: true,
        message: "Fetched from Database",
        summary: existingSummary.summary,
      });
    }

   

    // 2. If not found, generate a new summary using Gemini AI
    
    // prompt = `Write a ${queryType} job description and bold heading:\n${query}`;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // 3. Save the new query and its response to the database
    const newSummary = new Summary({
      query,
      queryType,
      summary: response,
    });

    await newSummary.save();

    // 4. Return the response
    res.status(201).json({
      success: true,
      message: "Summary Generated",
      summary: response,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ success: false, message: "AI service failed" });
  }
};


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


const extractDetails = (text) => {
  const nameRegex = /Name[:\s]*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const mobileRegex = /\b\d{10}\b/;
  const educationRegex = /Education[:\s]*(.*)/i;
  const workRegex = /Experience[:\s]*(.*)/i;

  return {
    name: text.match(nameRegex)?.[1] || 'Unknown',
    email: text.match(emailRegex)?.[0] || 'Unknown',
    mobile: text.match(mobileRegex)?.[0] || 'Unknown',
    education: text.match(educationRegex)?.[1] || 'Not Found',
    work_experience: text.match(workRegex)?.[1] || 'Not Found'
  };
};

// export const summarizeCV = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ error: "No file uploaded." });

//     let extractedText = "";

//     // Extract text based on file type
//     if (file.mimetype === "application/pdf") {
//       extractedText = await extractTextFromPDF(file.buffer);
//     } else if (file.mimetype.startsWith("image/")) {
//       const { data: { text } } = await Tesseract.recognize(file.buffer, "eng");
//       extractedText = text;
//     } else {
//       return res.status(400).json({ error: "Unsupported file format." });
//     }

//     // Extract details from CV text
//     const { name, email, mobile, education, work_experience } = extractDetails(extractedText);

//     // Check if CV already exists in the database
//     const existingCV = await CV.findOne({ $or: [{ email }, { mobile }] });
//     if (existingCV) {
//       const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//       const result = await model.generateContent(`Summarize this CV:\n${extractedText}`);
      
//       const summary = await result.response.text();
//       return res.status(200).json({ message: "CV already exists in database.", existingCV, summary });
//     }

//     // Upload to Cloudinary (wrapped in a promise) 
//     const uploadToCloudinary = (fileBuffer) => {
//       return new Promise((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { resource_type: "raw", folder: "CVs" },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary upload error:", error);
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           }
//         );
//         uploadStream.end(fileBuffer);
//       });
//     };

//     // Wait for Cloudinary Upload
//     const result = await uploadToCloudinary(file.buffer);

//     // Save CV details in the database
//     const newCV = new CV({
//       name,
//       email,
//       mobile,
//       education,
//       work_experience,
//       cvFileUrl: result.secure_url,
//     });

//     await newCV.save();

//     // Generate AI summary
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const aiResult = await model.generateContent(`Summarize this CV:\n${extractedText}`);
//     const summary = await aiResult.response.text();

//     res.json({ summary, savedCV: newCV });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Failed to process the file." });
//   }
// };

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "CVs" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// const extractCVDetails = async (extractedText) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//   const prompt = `Extract the following details from the given resume text. Return the response strictly in a JSON object with the exact fields as below. If a field is not present, set it to null. Do not add any extra explanation.

// EXPECTED JSON FORMAT:
// {
//   "name": "",
//   "email": "",
//   "mtech_college_name": null,
//   "mtech_year": null,
//   "mtech_marks": null,
//   "mtech_branch": null,
//   "btech_college_name": "",
//   "btech_year": "",
//   "btech_marks": "",
//   "btech_branch": "",
//   "isc_name": "",
//   "isc_marks": "",
//   "isc_year": "",
//   "matriculation_school_name": "",
//   "matriculation_year": "",
//   "matriculation_marks": "",
//   "work_experience": [
//     {
//       "company_name": "",
//       "position": "",
//       "duration": "",
//       "year": ""
//     }
//   ],
//   "summary": ""
// }

// Instructions:
// - Carefully analyze the resume text.
// - Provide a **detailed and professional summary** in the "summary" field based on the candidate’s education, skills, and work experience mentioned in the resume.
// - The summary should be written in **2-3 paragraphs** highlighting the candidate's education, technical expertise, professional achievements, and strengths.
// - If information is missing, infer based on context or leave it as null. Avoid fabricating facts.

// Resume Text:
// ${extractedText}

// Return only the JSON object with no extra text.`;

//   const result = await model.generateContent(prompt);
//   const aiExtractedData = JSON.parse(result.response.text());

//   return aiExtractedData;
// };

const extractCVDetails = async (extractedText) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Extract the following details from the given resume text. Return the response strictly as a valid JSON object. Do not add any extra explanation(expcept summery,it should be detailed), text, or notes. Return only the JSON object. If any field is missing in the resume, set it to null.

JSON SCHEMA:
{
  "name": "",
  "email": "",
  "mobile": "",
  "mtech_college_name": null,
  "mtech_year": null,
  "mtech_marks": null,
  "mtech_branch": null,
  "btech_college_name": "",
  "btech_year": "",
  "btech_marks": "",
  "btech_branch": "",
  "isc_name": "",
  "isc_marks": "",
  "isc_year": "",
  "matriculation_school_name": "",
  "matriculation_year": "",
  "matriculation_marks": "",
  "work_experience": [
    {
      "company_name": "",
      "position": "",
      "duration": "",
      "year": ""
    }
  ],
  "summary": ""
}

Summary should be detailed, professional, highlighting education, technical expertise, work experience, and strengths point wise in more than 300 words and less than 500 words.

Resume Text:
${extractedText}

Return only the JSON object. No extra text.`;

  const result = await model.generateContent(prompt);
  const textResponse = await result.response.text();


  // Attempt to extract JSON safely (in case of any extra text)
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/); // Extracts first valid JSON object from text

  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON.");
  }

  const aiExtractedData = JSON.parse(jsonMatch[0]); // Parse only the JSON part

  return aiExtractedData;
};



export const summarizeCV = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded." });

    let extractedText = "";

    // Extract text based on file type
    if (file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(file.buffer);
    } else if (file.mimetype.startsWith("image/")) {
      const { data: { text } } = await Tesseract.recognize(file.buffer, "eng");
      extractedText = text;
    } else {
      return res.status(400).json({ error: "Unsupported file format." });
    }

    // Extract details from AI
    const details = await extractCVDetails(extractedText);

    // Check if CV already exists
    const existingCV = await CV.findOne({
      email: new RegExp(details.email, "i"),
    });

    if (existingCV) {
      return res.status(200).json({
        message: "CV already exists in database.",
        existingCV,
      });
    }

    // Upload CV to Cloudinary
    const result = await uploadToCloudinary(file.buffer);

    // Prepare work experience array (handling null or empty experience)
    const workExperienceArray =
      details.work_experience && details.work_experience.length > 0
        ? details.work_experience.map((exp) => ({
            company_name: exp.company_name || null,
            position: exp.position || null,
            duration: exp.duration || null,
            year: exp.year || null,
          }))
        : [];

    // Save CV in Database
    const newCV = new CV({
      name: details.name,
      email: details.email,
      mobile: details.mobile,
      mtech_college_name: details.mtech_college_name,
      mtech_year: details.mtech_year,
      mtech_marks: details.mtech_marks,
      mtech_branch: details.mtech_branch,
      btech_college_name: details.btech_college_name,
      btech_year: details.btech_year,
      btech_marks: details.btech_marks,
      btech_branch: details.btech_branch,
      isc_name: details.isc_name,
      isc_marks: details.isc_marks,
      isc_year: details.isc_year,
      matriculation_school_name: details.matriculation_school_name,
      matriculation_year: details.matriculation_year,
      matriculation_marks: details.matriculation_marks,
      work_experience: workExperienceArray,
      cvFileUrl: result.secure_url,
      summary:details.summary
    });

    await newCV.save();
    res.status(201).json({
      summary:details.summary,
      message: "CV saved successfully",
      savedCV: newCV,
    });
  } catch (error) {
    console.error("Error processing CV:", error);
    res.status(500).json({ error: "Failed to process the file." });
  }
};

export const fetchAllCV=async(req, res)=>{
  const cvs=await CV.find();
  if(!cvs)
  {
    res.status(400).json({success:false , message: "CV Store is empty"})
  }
  res.status(200).json({success:true,CV:cvs})
}

// export const getCVById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find CV by ID
//     const cv = await CV.findById(id);
//     if (!cv) {
//       return res.status(404).json({ error: "CV not found" });
//     }

//     res.set({
//       "Content-Type": cv.cvFile.contentType,
//       "Content-Disposition": `attachment; filename="cv_${cv.name}.pdf"`
//     });

//     // Send the binary file
//     res.send(cv.cvFile.data);
//   } catch (error) {
//     console.error("Error fetching CV:", error);
//     res.status(500).json({ error: "Failed to retrieve CV" });
//   }
// };

export const getCVById = async (req, res) => {
  try {
    const { id } = req.params;
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ error: "CV not found" });
    }

    res.status(200).json({ success: true, cvFileUrl: cv.cvFileUrl });
  } catch (error) {
    console.error("Error fetching CV:", error);
    res.status(500).json({ error: "Failed to retrieve CV" });
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


// const extractTextFromPDF = async (pdfBuffer) => {
//   try {
//     const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
//     const pdf = await loadingTask.promise;

//     let textContent = '';

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const content = await page.getTextContent();
//       const textItems = content.items.map(item => item.str).join(' ');
//       textContent += textItems + '\n';
//     }

//     return textContent;
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     throw error;
//   }
// };

// export default extractTextFromPDF;



  
//   export const summarizeCV = async (req, res) => {
//     try {
//       const file = req.file;
//       let extractedText = '';
  
//       if (!file) {
//         return res.status(400).json({ error: 'No file uploaded.' });
//       }
  
//       if (file.mimetype === 'application/pdf') {
//         extractedText = await extractTextFromPDF(file.buffer);
//       }else if (file.mimetype.startsWith('image/')) {
//         const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
//         extractedText = text;
//       } else {
//         return res.status(400).json({ error: 'Unsupported file format.' });
//       }
  
//       const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//       const result = await model.generateContent(`Summarize this CV in 500 words:\n${extractedText}`);
//       const summary = await result.response.text();
  
//       res.json({ summary });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Failed to process the file.' });
//     }
//   };




// const UPLOAD_DIR = 'uploads/';  // Folder to store PDFs

// // Ensure uploads directory exists
// fs.ensureDirSync(UPLOAD_DIR);

// const extractTextFromPDF = async (pdfBuffer) => {
//   try {
//     const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
//     const pdf = await loadingTask.promise;
//     let textContent = '';

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const content = await page.getTextContent();
//       const textItems = content.items.map(item => item.str).join(' ');
//       textContent += textItems + '\n';
//     }

//     return textContent;
//   } catch (error) {
//     console.error('Error extracting text from PDF:', error);
//     throw error;
//   }
// };

// const extractDetails = (text) => {
//   const nameRegex = /Name[:\s]*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/;
//   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
//   const mobileRegex = /\b\d{10}\b/;
//   const educationRegex = /Education[:\s]*(.*)/i;
//   const workRegex = /Experience[:\s]*(.*)/i;

//   const nameMatch = text.match(nameRegex);
//   const emailMatch = text.match(emailRegex);
//   const mobileMatch = text.match(mobileRegex);
//   const educationMatch = text.match(educationRegex);
//   const workMatch = text.match(workRegex);

//   return {
//     name: nameMatch ? nameMatch[1] : 'Unknown',
//     email: emailMatch ? emailMatch[0] : 'Unknown',
//     mobile: mobileMatch ? mobileMatch[0] : 'Unknown',
//     education: educationMatch ? educationMatch[1] : 'Not Found',
//     work_experience: workMatch ? workMatch[1] : 'Not Found'
//   };
// };

// export const summarizeCV = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ error: 'No file uploaded.' });

//     let extractedText = '';

//     if (file.mimetype === 'application/pdf') {
//       extractedText = await extractTextFromPDF(file.buffer);
//     } else if (file.mimetype.startsWith('image/')) {
//       const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');
//       extractedText = text;
//     } else {
//       return res.status(400).json({ error: 'Unsupported file format.' });
//     }

//     // Extract key details
//     const { name, email, mobile, education, work_experience } = extractDetails(extractedText);

//     // Check if the CV already exists
//     const existingCV = await CV.findOne({ $or: [{ email }, { mobile }] });
//     if (existingCV) {
//       return res.status(200).json({ message: 'CV already exists in database.', existingCV });
//     }

//     // Save PDF file to uploads folder
//     const filePath = path.join(UPLOAD_DIR, `${Date.now()}-${file.originalname}`);
//     await fs.writeFile(filePath, file.buffer);

//     // Store new CV details in MongoDB
//     const newCV = new CV({
//       name,
//       email,
//       mobile,
//       education,
//       work_experience,
//       raw_text: extractedText,
//       pdfPath: filePath  // Store path to saved PDF
//     });
//     await newCV.save();

//     // Summarize with Gemini AI
//     const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
//     const result = await model.generateContent(`Summarize this CV:\n${extractedText}`);
//     const summary = await result.response.text();

//     res.json({ summary, savedCV: newCV });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Failed to process the file.' });
//   }
// };