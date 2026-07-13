const express = require("express");

const {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const verifyJWT = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", verifyJWT, createSubmission);
router.get("/", verifyJWT, getMySubmissions);
router.get("/:id", verifyJWT, getSubmissionById);

module.exports = router;
