import express from "express"
import {  fetchAllCV, generateQueryAnswer, getCVById, summarizeCV} from "../Controller/AiController.js";
import multer from "multer";
import { isAuthenticated } from "../Middleware/auth.js";

const router=express.Router()

const upload = multer({ storage: multer.memoryStorage() });
router.post("/summarize/cv", upload.single('file'), summarizeCV);
router.post("/query/answer", generateQueryAnswer);
router.get("/all/cv",fetchAllCV);
router.get('/cv/:id', getCVById);



export default router;