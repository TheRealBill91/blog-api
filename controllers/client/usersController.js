const RegularUser = require("../../models/regular_user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const passport = require("passport");

// POST request for user sign up
exports.signup_post = [
  body("username", "Username is required")
    .trim()
    .isLength({ min: 1, max: 14 })
    .withMessage("Username must be between 1 and 14 characters")
    .custom(async (value) => {
      const user = await RegularUser.find({ username: value });
      if (user.length > 1) {
        throw new Error("A user already exists with this username");
      }
    })
    .withMessage("Username is taken, try something different")
    .escape(),
  body("email", "Email is required")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Email not long enough")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom(async (value) => {
      const user = await RegularUser.find({ email: value });
      if (user.length > 1) {
        throw new Error("A user already exists with this email");
      }
    })
    .withMessage("Email address already exists")
    .normalizeEmail()
    .escape(),
  body("password", "password is required")
    .trim()
    .isStrongPassword({ minSymbols: 0 })
    .withMessage(
      "Password must have 8 characters, 1 lowercase, 1 uppercase, & 1 number",
    )
    .isLength({ min: 1, max: 20 })
    .withMessage("Password must be between 1 and 20 characters")
    .escape(),
  body("passwordConfirmation", "You must confirm your password")
    .trim()
    .isLength({ min: 1 })
    .custom((value, { req }) => {
      console.log(value);
      return value === req.body.password;
    })
    .withMessage("Passwords do not match, try again")
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    // Errors exist in signup inputs
    if (!errors.isEmpty()) {
      res.status(401).json({
        errors: errors.array(),
      });

      // No errors exist in  sign up inputs, proceed with  signup
    } else if (errors.isEmpty()) {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log("Bcrypt error");
          res.status(500).json({ error: err.message });
        } else {
          const user = new RegularUser({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
          });
          try {
            await user.save();
          } catch (error) {
            return res.sendStatus(error);
          }

          if (req.isAuthenticated()) {
            req.logout(function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
            });
            req.login(user, function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              return res.status(200).json(user);
            });
          }
          req.login(user, function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(200).json(user);
          });
        }
      });
    }
  },
];

exports.auth_status = async (req, res, next) => {
  const isAuth = req.isAuthenticated();
  // console.log("auth status: " + isAuth);
  if (isAuth) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
};
