import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// here we just define below methods but their real use in production

// DATA IN JSON FORM
app.use(express.json({ limit: "16kb" }));

// data from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// DATA SAVE IN MY SERVER maybe in pdf, svg
app.use(express.static("public"));

// cookie-parser
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello I am your Server!");
});

//import user routes

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);
export { app };
