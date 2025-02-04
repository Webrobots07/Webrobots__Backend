import express from "express"
import {  generateQueryAnswer} from "../Controller/UserController.js";

const router=express.Router()


router.post("/query/answer", generateQueryAnswer);


export default router;