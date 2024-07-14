import { Listing } from "../models/listing.models.js";
import { User } from "../models/user.models.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const test = (req, res) => {
  res.json({
    message: "API from user.controller",
  });
};
// => update user controller
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "Not Authenticated to update"));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
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
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
    // res.status(200).json(password);
    // console.log(password, rest);
  } catch (error) {
    next(error);
  }
};
// => delete user controller
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your account"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};
// => getUserListing

export const getUserListing = async (req, res, next) => {
  // console.log(`"userID": ${req.user.id}, "paramID: ${req.params.id}"`);
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({userRef: req.params.id})
      res.status(200).json(listings)
    } catch (error) {
      next(error)
    }
  } else{
    return next(errorHandler(401, "You can only view your listings."))
  }
}
