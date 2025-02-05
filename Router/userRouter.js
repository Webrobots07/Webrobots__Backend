import express from "express"
import {  generateQueryAnswer, summarizeCV} from "../Controller/UserController.js";
import multer from "multer";

const router=express.Router()

const upload = multer({ storage: multer.memoryStorage() });
router.post("/summarize/cv", upload.single('file'), summarizeCV);
router.post("/query/answer", generateQueryAnswer);



export default router;