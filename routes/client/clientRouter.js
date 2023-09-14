const express = require("express");
const clientRouter = express.Router();

const usersRouter = require("./users");
const loginOutRouter = require("./loginOut");
const blogContentRouter = require("./blogContent");

clientRouter.use("/", blogContentRouter);
clientRouter.use("/users", usersRouter);
clientRouter.use("/auth", loginOutRouter);
clientRouter.use("*", (req, res) => {
  res.status(404).json("Resource not found");
});

module.exports = clientRouter;
