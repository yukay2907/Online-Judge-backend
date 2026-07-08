const express = require("express");
const router = express.Router();
const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");

router.post("/", createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

module.exports = router;
