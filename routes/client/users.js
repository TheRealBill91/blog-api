const express = require("express");
const users_controller = require("../../controllers/client/usersController");
const usersRouter = express.Router();
const RateLimit = require("express-rate-limit");

const authStatusGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

usersRouter.get(
  "/authstatus",
  authStatusGetLimiter,
  users_controller.auth_status,
);

const signupPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

usersRouter.post("/signup", signupPostLimiter, users_controller.signup_post);

module.exports = usersRouter;
