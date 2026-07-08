const Problem = require("../models/Problem");

const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, sampleInput, sampleOutput } =
      req.body;

    if (!(title && description && difficulty && sampleInput && sampleOutput)) {
      return res.status(400).json({
        success: false,
        message: "Please send all the information.",
      });
    }
    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: "Problem with same name already exists.",
      });
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    return res.status(200).json({
      success: true,
      problems,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }
    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = req.body;

    const problem = await Problem.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }
    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem does not exist.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
