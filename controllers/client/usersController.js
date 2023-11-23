const RegularUser = require("../../models/regular_user");
const Token = require("../../models/token");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../bin/utils/sendEmail");
const getEmailHTML = require("../../bin/utils/getEmailConfirmation");
const crypto = require('crypto');
require("dotenv").config();
const { body, validationResult } = require("express-validator");

// POST request for user sign up
exports.signup_post = [
  body("username", "Username is required")
    .trim()
    .isLength({ min: 1, max: 14 })
    .withMessage("Username must be between 1 and 14 characters")
    .custom(async (value) => {
      const user = await RegularUser.findOne({
        "local.username": value,
      }).exec();
      if (user) {
        throw new Error("Username already exists");
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
      const user = await RegularUser.findOne({
        "local.email": value,
      }).exec();
      if (user) {
        throw new Error("A user already exists with this e-mail address");
      }
    })
    .withMessage("Email address already exists")
    .normalizeEmail()
    .escape(),
  body("password", "password is required")
    .trim()
    .isStrongPassword({ minSymbols: 1 })
    .withMessage(
      "Password must have 8 characters, 1 lowercase, 1 uppercase, & 1 number",
    )
    .isLength({ min: 1, max: 20 })
    .withMessage("Password must be between 1 and 20 characters"),
  body("passwordConfirmation", "You must confirm your password")
    .trim()
    .isLength({ min: 1 })
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match, try again"),

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
            method: "local",
            local: {
              username: req.body.username,
              email: req.body.email,
              password: hashedPassword,
            },
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
              return res
                .status(200)
                .json({ successMessage: "login successful" });
            });
          }
          req.logIn(user, function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            return res.status(201).json();
          });
        }
      });
    }
  },
];

exports.auth_status = async (req, res, next) => {
  const isAuth = req.isAuthenticated();
  if (isAuth) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
};

exports.request_password_reset = [
  body("email", "Email is required")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Email not long enough")
    .isEmail(),

  async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      try {
        const user = await RegularUser.findOne({
          "local.email": req.body.email,
        });
        if (!user)
          return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
          token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }

        const link = `${process.env.BASE_URL}/v1/client/users/validate-password-reset-token/${user._id}/${token.token}`;

        const emailHTML = await getEmailHTML.getEmailConfirmationHtml(
          link,
          "passwordResetEmailTemplate",
        );

        await sendEmail.send_mail(res, user.email, "Password reset", emailHTML);
      } catch (error) {
        res.send("An error occured");
        console.log(error);
      }
    } else if (errors.isEmpty()) {
      res.status(401).json({
        errors: errors.array(),
      });
    }
  },
];

exports.validate_password_reset_token = async (req, res, next) => {
  const { userId, token } = req.query;

  const user = await RegularUser.findById(userId);

  if (!user) {
    return res.sendStatus(404);
  }

  const urlToken = await Token.findOne({
    userId: user._id,
    token,
  });

  if (!urlToken)
    return res
      .status(400)
      .json({ error: "Link is no longer valid or has expired" });

  return res.sendStatus(200);
};
