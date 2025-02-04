import express from "express"
import {  generateQueryAnswer, Register } from "../Controller/UserController.js";

const router=express.Router()

router.post("/register",Register)
router.post("/query/answer", generateQueryAnswer);


export default router;