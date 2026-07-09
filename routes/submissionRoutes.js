const express = require("express");

const { createSubmission } = require("../controllers/submissionController");
const verifyJWT = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", verifyJWT, createSubmission);

module.exports = router;
