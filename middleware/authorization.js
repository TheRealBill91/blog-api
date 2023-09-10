exports.adminAuthorization = (req, res, next) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  const isAuthenticated = req.user && req.isAuthenticated();
  const isAdmin = isAuthenticated && req.user.admin === true;

  if (isAuthenticated && isAdmin) {
    return next();
  } else {
    req.flash("messageFailure", "Admin access required");
res.redirect("/login")
    res.status(403).send("Admin access required");
  }
};
