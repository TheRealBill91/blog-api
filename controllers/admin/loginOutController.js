const passport = require("passport");
const { body } = require("express-validator");


// Display login up form
exports.login_get = (req, res, next) => {
  res.render("login_form", {
    pageTitle: "Log in",
    title: "Log in",
  });
};



exports.login_post = [
  body("email").trim().isEmail().normalizeEmail().escape(),
  body("password").trim(),

  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",

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

exports.logout_post = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.flash("messageSuccess", "Successfully logged out");
  res.redirect("/");
};
