const User = require("../../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const passport = require("passport");

// Display sign up form
exports.signup_get = (req, res, next) => {
  res.render("sign_up_form", {
    title: "Sign Up",
  });
};

// POST request for user sign up
exports.signup_post = [
  body("first_name", "First name is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must be at least one letter")
    .escape(),
  body("last_name", "Last name is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name must be atleast one letter")
    .escape(),
  body("email", "Email is required")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Email not long enough")
    .isEmail()
    .withMessage("Please enter a valid email (test@example.com")
    .custom(async (value) => {
      const user = await User.find({ email: value });
      if (user.length) {
        throw new Error("A user already exists with this e-mail address");
      }
    })
    .withMessage("Email address already exists")
    .normalizeEmail()
    .escape(),
  body("password", "password is required")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least five charcters")
    .isStrongPassword(),
  body("confirm_password", "You must confirm your password")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match, try again"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Errors exist in signup inputs
    if (!errors.isEmpty()) {
      res.render("sign_up_form", {
        pageTitle: "Sign Up",
        title: "Sign Up",
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        errors: errors.array(),
      });
      // No errors exist in  sign up inputs, proceed with  signup
    } else if (errors.isEmpty()) {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log("Bcrypt error");
          res.redirect("/sign-up");
        } else {
          const user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            membership_status: false,
            admin: true,
          });
          await user.save();
          if (req.isAuthenticated()) {
            req.logout(function (err) {
              if (err) {
                return next(err);
              }
            });
            req.login(user, function (err) {
              if (err) {
                return next(err);
              }
              return res.redirect("/");
            });
          }
          req.login(user, function (err) {
            if (err) {
              return next(err);
            }
            return res.redirect("/");
          });
        }
      });
    }
  }),
];
