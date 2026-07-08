const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
  const MONGO_URL = process.env.MONGODB_URL;
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB Connection established");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

module.exports = { DBConnection };
