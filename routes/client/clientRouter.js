const express = require("express");
const clientRouter = express.Router();

const usersRouter = require("./users");
const loginOutRouter = require("./loginOut");
const blogContentRouter = require("./blogContent");

clientRouter.use("/users", usersRouter);
clientRouter.use("/auth", loginOutRouter);
clientRouter.use("/content", blogContentRouter);

module.exports = clientRouter;
