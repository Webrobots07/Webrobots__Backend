import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../Model/UserModel.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password,phone,image } = req.body;

        if(!name || !email || !password || !phone)
        {
            return res.status(400).json({
                success:false,
                message:"Please Fill Full Details" 
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword,phone,image});
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password)
        {
            return res.status(400).json({
                message:"Please Provide All Details"
            })
        }
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User with this email not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "None" });
        res.status(200).cookie("token",token,{
            httpOnly:true,
            sameSite:"lax",
            secure: true,
        }).json({
            success:true,
            message:"user loggedIn successfully",
            user,
            token
        })

        // res.status(200).json({ message: "User Loggedin successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });

    }
};


export const googleAuthSuccess = (req, res) => {
    if (req.user) {
        const token = req.user.token;

        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "lax" });
        res.redirect("http://localhost:5173/");
    } else {
        res.status(400).json({ message: "Google login failed" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax" });
    res.status(200).json({ message: "Successfully logged out" });
};

export const getUser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User found", user });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};