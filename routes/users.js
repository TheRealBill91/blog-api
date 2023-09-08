const express = require("express");
const users_controller = require("../controllers/usersController");
const router = express.Router();

router.get("/sign-up", users_controller.signup_get);

router.post("/sign-up", users_controller.signup_post);

module.exports = router;
