require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const db = require("./config/db");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});