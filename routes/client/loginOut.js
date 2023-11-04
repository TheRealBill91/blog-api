const express = require("express");
const loginOutRouter = express.Router();

const loginOutController = require("../../controllers/client/loginOutController");
const RateLimit = require("express-rate-limit");

const userLoginPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7, // Limit each IP to 5 login requests per `window` (here, per hour)
  message: "Too many logins from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

loginOutRouter.post(
  "/login",
  userLoginPostLimiter,
  loginOutController.login_post,
);

const logoutPostLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per window
  message:
    "Too many logout attempts from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

// Confirms user auth for google login
loginOutRouter.get(
  "/google_login/success",
  userLoginPostLimiter,
  loginOutController.google_login_success,
);

// Handles google login failure
loginOutRouter.get(
  "/google_login/failure",
  userLoginPostLimiter,
  loginOutController.google_login_failure,
);

loginOutRouter.get(
  "/login/google",
  userLoginPostLimiter,
  loginOutController.google_login,
);

loginOutRouter.get(
  "/oauth2/redirect/google",
  userLoginPostLimiter,
  loginOutController.google_login_redirect,
);

loginOutRouter.post(
  "/logout",
  logoutPostLimiter,
  loginOutController.logout_post,
);

module.exports = loginOutRouter;
