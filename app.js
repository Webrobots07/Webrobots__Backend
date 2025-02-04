import express from "express"
import UserRouter from "./Router/userRouter.js"
import cors from "cors"

const app=express()
app.use(cors());

// OR for specific origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
// app.use(cookieParser())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get("/home",(res,req)=>{
   req.send("Home page")
})

app.use("/api/v1/user",UserRouter)

export default app