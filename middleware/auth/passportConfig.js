const passport = require("passport");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

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

exports.passportStrategy = () => {
  passport.use(
    "local",
    new LocalStrategy(
      {
        // Fields to accept
        usernameField: "email", // default is username, override to accept email
        passwordField: "password",
        passReqToCallback: true, // allows us to access req in the call back
      },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ email: email });
          // console.log("user:" + user);
          if (!user) {
            return done(null, false, {
              message: "Incorrect email and/or password",
            });
          }
          const passwordMatch =
            user && (await bcrypt.compare(password, user.password));
          if (!passwordMatch) {
            return done(null, false, {
              message: "Incorrect email and/or password",
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
};

exports.passportInitialization = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());
};
