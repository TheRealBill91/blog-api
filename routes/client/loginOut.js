const express = require("express");
const loginOutRouter = express.Router();

const loginOut_controller = require("../../controllers/client/loginOutController");

loginOutRouter.post("/login", loginOut_controller.login_post);

loginOutRouter.get("/logout", loginOut_controller.logout_get);

module.exports = loginOutRouter;
