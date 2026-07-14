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

  const result = await executeCode({
    submissionId: submission._id,
    code,
    language,
    testCases: existingProblem.testCases,
  });

  submission.status = "Completed";
  submission.verdict = result.verdict;
  submission.runtime = result.runtime;
  submission.memory = result.memory;
  submission.stdout = result.stdout;
  submission.stderr = result.stderr;

  await submission.save();

  return res
    .status(201)
    .json(new ApiResponse(201, submission, "Submission created successfully"));
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const submissions = await Submission.find({
    user: userId,
  })
    .populate("problem", "title difficulty")
    .sort({ createdAt: -1 })
    .limit(20);

  return res
    .status(200)
    .json(
      new ApiResponse(200, submissions, "Submissions fetched successfully."),
    );
});

const getSubmissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Submission ID");
  }

  const submission = await Submission.findById(id);

  if (!submission) {
    throw new ApiError(404, "Submission Not Found");
  }

  if (!submission.user.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to view this submission.");
  }

  await submission.populate("problem", "title difficulty");

  return res
    .status(200)
    .json(new ApiResponse(200, submission, "Submission fetched succefully."));
});

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
};
