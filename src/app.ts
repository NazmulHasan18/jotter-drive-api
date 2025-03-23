import express, { Application } from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import "./config/passport";
import notFound from "./errors/NotFound";
import globalErrorHandler from "./errors/globalErrorHandler";
import path from "path";
import fileRoutes from "./routes/fileRoutes";
import folderRoutes from "./routes/folderRoutes";
import multiModelRoute from "./routes/multiModelRoutes";
import userRouter from "./routes/userRoutes";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(cors({}));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/file", fileRoutes);
app.use("/folder", folderRoutes);
app.use("/api", multiModelRoute);
app.use("/user", userRouter);

app.get("/", (req, res) => {
   res.send("Hello World");
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
