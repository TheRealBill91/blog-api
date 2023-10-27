const passport = require("passport");
const User = require("../../models/user");
const RegularUser = require("../../models/regular_user");
const googleUser = require("../../models/googleUser");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser(function (user, done) {
  done(null, { userId: user.id, userSource: user.source });
});

passport.deserializeUser(async function (obj, done) {
  const { userId, userSource } = obj;
  try {
    let user;
    if (userSource === "regularUser") {
      user = await RegularUser.findById(userId);
    } else if (userSource === "google") {
      user = await googleUser.findById(userId);
    } else {
      user = await User.findById(userId);
    }

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
            const user = await User.findOne({ email });

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
            const user = await RegularUser.findOne({ email });

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
  } else if (passportType === "google") {
    passport.use(
      new GoogleStrategy(
        {
          callbackURL: "/client/auth/oauth2/redirect/google",
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          scope: ["profile", "email"],
          state: true,
        },
        async (accessToken, refreshToken, profile, done) => {
          const id = profile.id;
          const email = profile.emails[0].value;
          const firstName = profile.name.givenName;
          const lastName = profile.name.familyName;
          const source = "google";

          const user = await googleUser
            .findOne({
              email,
            })
            .exec();

          if (!user) {
            const user = new googleUser({
              id,
              email,
              firstName,
              lastName,
              membership_status: false,
              admin: false,
              source,
            });
            await user.save();
            return done(null, user);
          }

          if (user.source != "google") {
            // return error
            return done(null, false, {
              message:
                "You have previously signed up with a different signin method",
            });
          }

          user.lastVisited = new Date();
          return done(null, user);
        },
      ),
    );
  }
};

exports.passportInitialization = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());
};
