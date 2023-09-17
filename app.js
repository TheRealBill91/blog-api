const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const adminInViews = require("./middleware/auth/adminInViews");
const passportMiddleware = require("./middleware/auth/passportConfig");
require("dotenv").config();

const adminRouter = require("./routes/admin/adminRouter");
const clientRouter = require("./routes/client/clientRouter");

const app = express();

if (app.get("env") !== "production") {
  app.use(helmet());
} else {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          // Only allow resources from the same origin to be loaded.
          defaultSrc: ["'self'"],
          // Only allow scripts from the same origin and www.billycummings.com.
          scriptSrc: ["'self'", "'www.billycummings.com'"],
          // Allow styles from the same origin and inline styles.
          styleSrc: ["'self'", "'unsafe-inline'"],
          // Only allow images from the same origin and data URIs.
          imgSrc: ["'self'", "data:"],
          // Only allow connections to the same origin and www.billycummings.com.
          connectSrc: ["'self'", "'www.billycummings.com'"],
          // Don't allow the page to be embedded in an iframe (clickjacking protection).
          frameAncestors: ["'none'"],
        },
      },
      // Don't send a Referer header.
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
}

const corsConfig = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

const cookie = {
  httpOnly: true,
};

// security option for mongo store
const crypto = {
  secret: false,
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  (cookie.secure = true),
    (crypto.secret = process.env.CRYPTO_SECRET),
    (corsConfig.origin = "https://www.billycummings.com");
}

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI || process.env.MONGODB_DEV_URI;

const mongoStore = MongoStore.create({
  mongoUrl: mongoDB,
  ttl: 4 * 24 * 60 * 60, // expires after 4 days,
  touchAfter: 24 * 3600, // only update session once per 24 hours (besides session data changing)
  collectionName: "sessions",
  crypto: crypto,
});

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* MAKE SURE TO USE TLS AND ADVANCED RATE LIMITING   */

app.use(logger("dev"));
// Need to configure cors further
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    name: "sessionId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: cookie,
    store: mongoStore,
  }),
);

app.use(flash());
passportMiddleware.passportInitialization(app);

app.use(adminInViews);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", adminRouter);

app.use("/client", cors(corsConfig), clientRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
