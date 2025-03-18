import express from "express"
import AiRouter from "./Router/AiRouter.js"
import UserRouter from "./Router/UserRoute.js"
import cors from "cors"
import {dbConnection} from "./DbConnection/DbCOnnection.js"
import dotenv from "dotenv"
import session from "express-session";
import cookieParser from "cookie-parser"
import passport from "passport";
import "./Controller/passport.js"; // Google OAuth Strategy setup

const app=express()
dotenv.config({path:"./Config/config.env"})
// app.use(cors());


app.use(cors({
  // origin: 'https://webrobot-ai.netlify.app', 
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
// app.options('*', cors());

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(passport.initialize());

app.use("/api/v1/user",AiRouter)
app.use("/api/v1/user/data",UserRouter)


dbConnection()



export default app