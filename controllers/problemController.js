const Problem = require("../models/Problem");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/apiResponse");

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
  return res
    .status(201)
    .json(new ApiResponse(201, problem, "Problem created successfully."));
});

const getProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();
  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems fetched successfully."));
});

const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid problem ID");
  }

  const problem = await Problem.findById(id);

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem fetched successfully."));
});

const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid problem ID");
  }

  const updatedData = req.body;

  const problem = await Problem.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem updated successfully."));
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid problem ID");
  }

  const problem = await Problem.findByIdAndDelete(id);
  if (!problem) {
    throw new ApiError(404, "Problem does not exist.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem deleted successfully."));
});

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
