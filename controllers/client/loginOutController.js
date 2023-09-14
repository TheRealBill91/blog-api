const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const passportMiddleware = require("../../middleware/auth/passportConfig");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

const { body, validationResult } = require("express-validator");

passportMiddleware.passportStrategy();

// This is for the client login API
exports.login_post = [
  body("email").trim().isEmail().normalizeEmail().escape(),
  body("password").trim().escape(),

  function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return res.json(err);
      }
      if (!user) {
        return res
          .status(400)
          .json({ message: "Incorrect email and/or password" });
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

exports.logout_get = (req, res, next) => {
  console.log("getting to logout?");
  req.logout(function (err) {
    if (err) {
      res.status(500).json(err);
    }
  });
  res.status(200).json({ message: "Successfully logged out" });
};
