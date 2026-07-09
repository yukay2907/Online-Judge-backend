const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");

router.post("/", verifyJWT, authorizeRoles("admin"), createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.put("/:id", verifyJWT, authorizeRoles("admin"), updateProblem);
router.delete("/:id", verifyJWT, authorizeRoles("admin"), deleteProblem);

module.exports = router;
