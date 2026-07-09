const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { executeCode } = require("../services/codeExecutionService");
const ApiResponse = require("../utils/ApiResponse");

const mongoose = require("mongoose");

const createSubmission = asyncHandler(async (req, res) => {
  const { problemId, language, code } = req.body;

  const userId = req.user._id;

  if (!(problemId && language && code)) {
    throw new ApiError(400, "...");
  }

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid Problem ID");
  }

  const existingProblem = await Problem.findById(problemId);

  if (!existingProblem) {
    throw new ApiError(404, "Problem Not Found.");
  }

  const submission = await Submission.create({
    user: userId,
    problem: problemId,
    language,
    code,
  });

  try {
    const result = await executeCode(code, language);

    submission.status = "Completed";
    submission.verdict = result.verdict;
    submission.runtime = result.runtime;
    submission.memory = result.memory;

    await submission.save();
  } catch (error) {
    submission.status = "Failed";

    await submission.save();

    throw new ApiError(500, "Code execution failed");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, submission, "Submission created successfully"));
});

module.exports = {
  createSubmission,
};
