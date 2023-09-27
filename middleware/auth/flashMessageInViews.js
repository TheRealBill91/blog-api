module.exports = (req, res, next) => {
  res.locals.messageSuccess = req.flash("messageSuccess");
  res.locals.messageFailure = req.flash("messageFailure");

  next();
};
