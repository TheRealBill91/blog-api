const express = require("express");
const loginOutRouter = express.Router();
const RateLimit = require("express-rate-limit");
const authorization = require("../../middleware/auth/authorization");

const loginOutController = require("../../controllers/admin/loginOutController");

const loginGetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per window
  message: "Too many requests from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

loginOutRouter.get("/login", loginGetLimiter, loginOutController.login_get);

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

loginOutRouter.post(
  "/logout",
  logoutPostLimiter,
  authorization.adminAuthorization,
  loginOutController.logout_post,
);

module.exports = loginOutRouter;
