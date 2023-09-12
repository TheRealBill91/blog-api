const express = require("express");
const users_controller = require("../../controllers/admin/usersController");
const usersRouter = express.Router();

usersRouter.get("/signup", users_controller.signup_get);

usersRouter.post("/signup", users_controller.signup_post);

module.exports = usersRouter;
