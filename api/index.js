import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
// => db connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected!!!");
  })
  .catch((err) => {
    console.log("error in connecting db", err);
  });
// => ctreate express app
const app = express();
// => allow the json data to our express app
app.use(express.json());

app.use(cookieParser());

app.listen(3000, () => {
  console.log(`Server is running on port 3000!!!`);
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// => Middleware to handle errors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
