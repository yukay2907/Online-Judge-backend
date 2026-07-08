const express = require("express");
const app = express();

const { DBConnection } = require("./database/db.js");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");

const cookieParser = require("cookie-parser");

DBConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}!`);
});
