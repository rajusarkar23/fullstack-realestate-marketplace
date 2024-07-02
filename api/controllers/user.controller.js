import { User } from "../models/user.models.js";
import { errorHandler } from "../utils/error.js";
import brcryptjs from "bcryptjs";

export const test = (req, res) => {
  res.json({
    message: "API from user.controller",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id != req.params.id)
    return next(errorHandler(401, "Not Authenticated to update"));
  try {
    if (req.body.password) {
      req.body.password = brcryptjs.hashSync(req.body.password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          avatar: req.body.avatar,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updateUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
