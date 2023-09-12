const express = require("express");
const adminRouter = express.Router();

const indexRouter = require("../admin/index");
const blogContentRouter = require("../admin/blogContent");
const loginOutRouter = require("../admin/loginOut");
const usersRouter = require("../admin/users");

adminRouter.use("/", indexRouter);
adminRouter.use("/", blogContentRouter);
adminRouter.use("/auth", loginOutRouter);
adminRouter.use("/users", usersRouter);

module.exports = adminRouter;
