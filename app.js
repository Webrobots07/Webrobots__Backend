import express from "express"
import UserRouter from "./Router/userRouter.js"
import cors from "cors"

const app=express()
app.use(cors());

// OR for specific origin
app.use(cors({
  origin: 'https://webrobots-dev-ai.netlify.app', 
    // origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());

// app.use(cookieParser())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get("/home",(req,res)=>{
   res.send("Home page")
})

app.use("/api/v1/user",UserRouter)

export default app