const express = require("express");
const cors = require("cors");

const app = express();

const { DBConnection } = require("./database/db.js");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const errorHandler = require("./middleware/errorHandler");

const cookieParser = require("cookie-parser");

DBConnection();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}!`);
});
