const passport = require("passport");
const User = require("../../models/user");
const RegularUser = require("../../models/regular_user");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser(function (user, done) {
  done(null, { userId: user.id, userSource: user.source });
});

passport.deserializeUser(async function (obj, done) {
  const { userId, userSource } = obj;
  try {
    const user =
      userSource === "regularUser"
        ? await RegularUser.findById(userId)
        : await User.findById(userId);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

exports.passportStrategy = (passportType) => {
  if (passportType === "admin") {
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
  } else if (passportType === "regularUser") {
    passport.use(
      "local-regularUser",
      new LocalStrategy(
        {
          // Fields to accept
          usernameField: "email", // default is username, override to accept email
          passwordField: "password",
          passReqToCallback: true, // allows us to access req in the call back
        },
        async (req, email, password, done) => {
          try {
            const user = await RegularUser.findOne({ email: email });

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
  }
};

exports.passportInitialization = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());
};
