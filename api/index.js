import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cookieParser from "cookie-parser";
import path from "path"
import cors from "cors"

const PORT = process.env.PORT || 3030;


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

  const __dirname = path.resolve()
// => ctreate express app
const app = express();
// => allow the json data to our express app
app.use(express.json());

app.use(cookieParser());

app.use(cors())

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// => index js routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// For running in the server
app.use(express.static(path.join(__dirname, "client/dist")))

// If you go any addresses other than above mentioned
app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
})

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
