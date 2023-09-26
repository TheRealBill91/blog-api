const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const passportMiddleware = require("../../middleware/auth/passportConfig");
const passport = require("passport");

const { body } = require("express-validator");

passportMiddleware.passportStrategy("regularUser");

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

exports.logout_post = (req, res, next) => {
  console.log("here?" + req.user);
  if (req.user.source === "regularUser") {
    
    req.logout(function (err) {
      if (err) {
        res.status(500).json(err);
      }
    });
    res.clearCookie("userSessionId");
    res.status(200).json({ message: "Successfully logged out" });
  }
};
