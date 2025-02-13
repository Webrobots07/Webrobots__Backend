import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Model/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

dotenv.config({ path: path.resolve("Config/config.env") });


passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID  ,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET ,
    callbackURL: "/api/v1/user/data/auth/google/callback",
    scope: ["profile", "email"],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value,
            });

            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return done(null, { user, token });
    } catch (error) {
        return done(error, null);
    }
}));