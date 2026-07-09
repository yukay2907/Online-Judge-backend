const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token; // "?" if the cookies doesn't exist then instead of throwing an error it will return undefined

  if (!token) {
    throw new ApiError(401, "Access token is missing.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password"); //Because we never need the password after authentication

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  req.user = user; //now every middleware and every controller after this can simply write without querying the database again

  next();
});

module.exports = verifyJWT;
