import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // => request access_token
  const token = req.cookies.access_token;
// => if access token not available "Not authorized"
  if (!token) return next(errorHandler(401, "Not authorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // => if error return with this error
    if (err) return next(errorHandler(403, "Forbidden"));
    // => else return the user as verified, pass the flag next() to updateUser
    req.user = user;
    next();
  });
};
