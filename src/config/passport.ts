import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User, { TUser } from "../models/User";
import config from ".";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

passport.use(
   new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
         const user: TUser | null = await User.findOne({ email });
         if (!user || !user.password) {
            return done(new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials"), false);
         }

         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return done(new AppError(httpStatus.UNAUTHORIZED, "Password not match"), false);
         }
         user.loggedOut = false;
         await user.save();
         return done(null, user);
      } catch (error) {
         return done(error);
      }
   })
);

passport.use(
   new GoogleStrategy(
      {
         clientID: config.google_client_id!,
         clientSecret: config.google_client_secret!,
         callbackURL: config.google_callback_url!,
      },
      async (accessToken, refreshToken, profile, done) => {
         try {
            const { displayName: name, emails, photos, id } = profile;
            const username = name.toLowerCase().split(" ").join("");

            let user: TUser | null = await User.findOne({ googleId: id });

            if (!user) {
               user = new User({
                  email: emails?.[0].value,
                  userImg: photos?.[0].value,
                  username,
                  name,
                  googleId: id,
               });
               await user.save();
            }
            user.loggedOut = false;
            await user.save();

            return done(null, user);
         } catch (error) {
            return done(error);
         }
      }
   )
);

passport.serializeUser((user: any, done) => {
   done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
   try {
      const userDoc = await User.findById(id);
      if (!userDoc) {
         return done(null, false);
      }

      // Convert Mongoose document to a plain JavaScript object
      const user = userDoc.toObject();

      // Remove password for security

      done(null, user); // Attach modified user object to req.user
   } catch (error) {
      done(error);
   }
});
