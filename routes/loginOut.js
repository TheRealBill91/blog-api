const express = require("express");
const router = express.Router();
const RateLimit = require("express-rate-limit");

const loginOut_controller = require("../controllers/loginOutController");

router.get("/login", loginOut_controller.login_get);

const userLoginLimiter = RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 7, // Limit each IP to 5 login requests per `window` (here, per hour)
  message: "Too many logins from this IP, please try again after an hour",
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // X-RateLimit-* headers
});

router.post("/login", userLoginLimiter, loginOut_controller.login_post);

router.get("/logout", loginOut_controller.logout_get);

module.exports = router;
