const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const passportMiddleware = require("../../middleware/auth/passportConfig");
const passport = require("passport");

require("dotenv").config();

const { body } = require("express-validator");

passportMiddleware.passportStrategy("regularUser");
passportMiddleware.passportStrategy("google");

const CLIENT_LOGIN_SUCCESS_URL =
  "http://localhost:5173/blog/google/loginsuccess";

const CLIENT_LOGIN_FAILURE_URL = "http://localhost:5173/blog/signin";

exports.google_login = passport.authenticate("google", { scope: ["profile"] });

// exports.google_login_redirect =

// This is for the client login API
exports.login_post = [
  body("email").trim().isEmail().normalizeEmail().escape(),
  body("password").trim().escape(),

  function (req, res, next) {
    passport.authenticate("local-regularUser", function (err, user, info) {
      if (err) {
        return res.json(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: "Incorrect email and/or password" });
      }
      if (req.isAuthenticated()) {
        return res.status(200).json({ message: "You're already logged in" });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: "logged in successfully" });
      });
    })(req, res, next);
  },
];

// Confirms user auth for google login
exports.google_login_success = (req, res, next) => {
  const isAuthenticated = req.user && req.isAuthenticated();
  if (isAuthenticated) {
    return res.status(200).json({ message: "user login successful" });
  } else {
    return res.status(400).json({ message: "user login unsuccessful" });
  }
};

// Handles failed google login
exports.google_login_failure = (req, res, next) => {
  return res.redirect(CLIENT_LOGIN_FAILURE_URL);
};

// exports.google_login_redirect = (req, res, next) => {

// };

exports.logout_post = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json(err);
    }
  });
  res.clearCookie("userSessionId");
  return res.status(200).json({ message: "Successfully logged out" });
};
