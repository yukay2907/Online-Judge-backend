const Problem = require("../models/Problem");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createProblem = asyncHandler(async (req, res) => {
  const { title, description, difficulty, sampleInput, sampleOutput } =
    req.body;

  if (!(title && description && difficulty && sampleInput && sampleOutput)) {
    throw new ApiError(400, "Please enter all the information.");
  }
  const existingProblem = await Problem.findOne({ title });
  if (existingProblem) {
    throw new ApiError(400, "Problem with same name already exists.");
  }

  const problem = await Problem.create({
    title,
    description,
    difficulty,
    sampleInput,
    sampleOutput,
  });
  return res.status(201).json({
    success: true,
    message: "Problem created successfully.",
    problem,
  });
});

const getProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();
  return res.status(200).json({
    success: true,
    problems,
  });
});

const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await Problem.findById(id);

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }
  return res.status(200).json({
    success: true,
    problem,
  });
});

const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedData = req.body;

  const problem = await Problem.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }
  return res.status(200).json({
    success: true,
    problem,
  });
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await Problem.findByIdAndDelete(id);
  if (!problem) {
    throw new ApiError(404, "Problem does not exist.");
  }
  return res.status(200).json({
    success: true,
    message: "Problem deleted successfully.",
  });
});

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
