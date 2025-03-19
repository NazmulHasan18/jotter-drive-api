import express, { Application } from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({}));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
   res.send("Hello World");
});

export default app;
