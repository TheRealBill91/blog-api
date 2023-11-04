const passport = require("passport");
const User = require("../../models/user");
const RegularUser = require("../../models/regular_user");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.serializeUser(function (user, done) {
  let userId;
  if (user.method === "local") {
    userId = user.id;
  } else if (user.method === "google") {
    userId = user.google.id;
  } else {
    userId = user.id;
  }
  done(null, { userId, userMethod: user.method });
});

passport.deserializeUser(async function (obj, done) {
  const { userId, userMethod } = obj;
  try {
    let user;
    if (userMethod === "local") {
      user = await RegularUser.findById(userId);
    } else if (userMethod === "google") {
      user = await RegularUser.findOne({ "google.id": userId });
    } else {
      user = await User.findById(userId);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

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
        const user = await RegularUser.findOne({ "local.email": email });

        if (!user) {
          return done(null, false, {
            message: "Incorrect email and/or password",
          });
        }
        const passwordMatch =
          user && (await bcrypt.compare(password, user.local.password));
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

      const user = await RegularUser.findOne({ "google.id": id }).exec();

      if (!user) {
        const user = new RegularUser({
          method: "google",
          google: {
            id,
            email,
            firstName,
            lastName,
            membership_status: false,
            admin: false,
          },
        });
        await user.save();
        return done(null, user);
      }

      if (user.method !== "google") {
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

exports.passportInitialization = function (app) {
  app.use(passport.session());
};
