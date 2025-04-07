import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

// Local Strategy for username/password authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// JWT Strategy for token authentication using a cookie extractor
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor, // Use our custom cookie extractor
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
