import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

dotenv.config();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("error");
  });

const app = express();
// => allow the json data
app.use(express.json());

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
