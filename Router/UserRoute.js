import express from "express";
import passport from "passport";
import { registerUser, loginUser, googleAuthSuccess, getUser, logout } from "../Controller/UserController.js";
import { isAuthenticated } from "../Middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", isAuthenticated, getUser); 
  
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"],session: false  }));
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login",session: false  }),
    googleAuthSuccess
);
export default router;
