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

// DATA IN JSON FORM
app.use(express.json({ limit: "16kb" }));

// data from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// DATA SAVE IN MY SERVER
app.use(express.static("public"));

// cookie-parser
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello I am your Server!");
});
export { app };
