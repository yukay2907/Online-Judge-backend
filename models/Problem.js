const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    sampleInput: {
      type: String,
      required: true,
    },
    sampleOutput: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
