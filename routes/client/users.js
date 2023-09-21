const express = require("express");
const users_controller = require("../../controllers/client/usersController");
const usersRouter = express.Router();

usersRouter.get("/authstatus", users_controller.auth_status);

usersRouter.post("/signup", users_controller.signup_post);

module.exports = usersRouter;
