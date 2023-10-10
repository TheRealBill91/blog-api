const express = require("express");
const users_controller = require("../../controllers/admin/usersController");
const usersRouter = express.Router();
const RateLimit = require("express-rate-limit");

const signupGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7, // Limit each IP to 7 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

// usersRouter.get("/signup", signupGetLimiter, users_controller.signup_get);

const signupPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7, // Limit each IP to 7 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

// usersRouter.post("/signup", signupPostLimiter, users_controller.signup_post);

module.exports = usersRouter;
