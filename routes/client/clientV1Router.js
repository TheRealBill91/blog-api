const express = require("express");
const clientV1Router = express.Router();

const usersRouter = require("./users");
const loginOutRouter = require("./loginOut");
const blogContentRouter = require("./blogContent");

clientV1Router.use("/", blogContentRouter);
clientV1Router.use("/users", usersRouter);
clientV1Router.use("/auth", loginOutRouter);
clientV1Router.use("*", (req, res) => {
  res.status(404).json("Resource not found");
});

module.exports = clientV1Router;
