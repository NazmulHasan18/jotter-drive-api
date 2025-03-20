import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User, { TUser } from "../models/User";
import config from ".";

passport.use(
   new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
         const user = await User.findOne({ email });
         if (!user || !user.password) return done(null, false, { message: "Invalid credentials" });

         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) return done(null, false, { message: "Invalid credentials" });

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
         console.log(profile);
         try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
               user = new User({
                  email: profile.emails?.[0].value,
                  googleId: profile.id,
               });
               await user.save();
            }

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
      const user = await User.findById(id);
      done(null, user);
   } catch (error) {
      done(error);
   }
});
