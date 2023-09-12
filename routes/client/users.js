const express = require("express");
const users_controller = require("../../controllers/client/usersController");
const usersRouter = express.Router();

usersRouter.post("/signup", users_controller.signup_post);


module.exports = usersRouter