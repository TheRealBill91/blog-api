const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const passportMiddleware = require("../../middleware/auth/passportConfig");
const { body, validationResult } = require("express-validator");

passportMiddleware.passportStrategy();

// Display login up form
exports.login_get = (req, res, next) => {
  res.render("login_form", {
    pageTitle: "Log in",
    title: "Log in",
  });
};

exports.login_post = [
  body("email").trim().isEmail().normalizeEmail().escape(),
  body("password").trim().escape(),

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",

    failureFlash: {
      type: "messageFailure",
      message: "Invalid email and/or password.",
    },
    successFlash: {
      type: "messageSuccess",
      message: "Successfull logged in.",
    },
  }),
];

exports.logout_get = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
  req.flash("messageSuccess", "Successfully logged out");
  res.redirect("/");
};