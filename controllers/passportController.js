const passport = require("passport");
const User = require("../models/user");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

exports.passportInitialization = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());
};