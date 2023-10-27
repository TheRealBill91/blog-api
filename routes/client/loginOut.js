const express = require("express");
const loginOutRouter = express.Router();

const loginOut_controller = require("../../controllers/client/loginOutController");
const RateLimit = require("express-rate-limit");

const passport = require("passport");

const CLIENT_LOGIN_SUCCESS_URL =
  "http://localhost:5173/blog/google/loginsuccess";

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
  loginOut_controller.login_post,
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
loginOutRouter.get("/login/success", loginOut_controller.google_login_success);

// Handles google login failure
loginOutRouter.get("/login/failure", loginOut_controller.google_login_failure);

loginOutRouter.get(
  "/login/google",
  passport.authenticate("google", {
    prompt: "select_account",
  }),
);

loginOutRouter.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/client/auth/login/failure",
  }),
  function (req, res) {
    res.redirect(CLIENT_LOGIN_SUCCESS_URL);
  },
);

loginOutRouter.post(
  "/logout",
  logoutPostLimiter,
  loginOut_controller.logout_post,
);

module.exports = loginOutRouter;
