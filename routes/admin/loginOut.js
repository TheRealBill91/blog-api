const express = require("express");
const loginOutRouter = express.Router();
const RateLimit = require("express-rate-limit");

const loginOut_controller = require("../../controllers/admin/loginOutController");

loginOutRouter.get("/login", loginOut_controller.login_get);

const userLoginLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7, // Limit each IP to 5 login requests per `window` (here, per hour)
  message: "Too many logins from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

loginOutRouter.post("/login", userLoginLimiter, loginOut_controller.login_post);

loginOutRouter.post("/logout", loginOut_controller.logout_post);

module.exports = loginOutRouter;
