const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");

const register = async (req, res) => {
  //get all data from the frontend
  const { firstName, lastName, email, password } = req.body;
  //check if all the data exists
  if (!(firstName && lastName && email && password)) {
    throw new ApiError(404, "Please send all the information.");
  }
  //add more validations
  //check if the user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists with the same email.");
  }
  //hashing/encrypting the password
  const hashedPassword = await bcrypt.hash(password, 10);
  //save the user in the db
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  //generate a token for the user and send it
  const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  user.token = token;
  user.password = undefined;
  res
    .status(200)
    .json(new ApiResponse(200, user, "You have successfully registered!"));
};

const login = async (req, res) => {
  //get all the data from frontend
  const { email, password } = req.body;
  //check if all the data is entered
  if (!(email && password)) {
    throw new ApiError(400, "Enter all the information.");
  }
  //check if the user exists in the db
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid email or password.");
  }
  //check if the correct password was entered
  const enteredPassword = await bcrypt.compare(password, user.password);
  if (!enteredPassword) {
    throw new ApiError(400, "Invalid email or password.");
  }
  //generate a token for the user and send it
  const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  user.token = token;
  user.password = undefined;
  //store token in cookies with options
  const options = {
    expiresIn: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true, //only manipulate by server and not by your client/frontend
  };
  //send the token
  res
    .status(200)
    .cookie("token", token, options)
    .json(new ApiResponse(200, token, "You have successfully logged in!"));
};

module.exports = { register, login };
