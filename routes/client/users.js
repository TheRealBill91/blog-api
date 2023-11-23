const express = require("express");
const usersController = require("../../controllers/client/usersController");
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
  usersController.auth_status,
);

const signupPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 5 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

usersRouter.post("/signup", signupPostLimiter, usersController.signup_post);

// const passwordResetRequest = RateLimit({
//   windowMs: 24 * 60 * 60 * 1000, // 24 hour
//   max: 10, // Limit each IP to 5 requests per window
//   message: "Too many requests from this IP, please try again after an hour",
//   standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
//   legacyHeaders: false, // X-RateLimit-* headers
// });

// usersRouter.post(
//   "/password-reset-request",
//   passwordResetRequest,
//   usersController.request_password_reset,
// );

// usersRouter.get(
//   "/validate-password-reset-token",
//   passwordResetRequest,
//   usersController.validate_password_reset_token,
// );

module.exports = usersRouter;
