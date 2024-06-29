import { User } from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// => signup functionality controller
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json("user created");
  } catch (error) {
    next(error);
  }
};

// => signin functionality controller
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // => check if user exist with the provided email in our db
    const validUser = await User.findOne({ email });

    // => if the email is not valid return the error, errorHandler created in error.js
    if (!validUser) return next(errorHandler(404, "User not found"));

    // => compare the password
    const validPassowrd = bcryptjs.compareSync(password, validUser.password);

    // => if not matched return error
    if (!validPassowrd) return next(errorHandler(401, "wrong credentials"));

    // => if both credentials are same as database, sign a token using jwt,
    // => jwt takes user id and our secret token to salt the token
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    // => take the all field except password
    const { password: pass, ...restData } = validUser._doc;

    // => return the response, set cookie name as access_token and allowed only http req,
    // => set status to 200, response with the restData
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(restData);
  } catch (error) {
    next(error);
  }
};

// => google signin functionality
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...restData } = user._doc;

      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(restData);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...restData } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(201)
        .json(restData);
    }
  } catch (error) {
    next(error);
  }
};
