exports.adminAuthorization = (req, res, next) => {
  const isAuthenticated = req.user && req.isAuthenticated();
  const isAdmin = isAuthenticated && req.user.admin === true;

  if (isAuthenticated && isAdmin) {
    return next();
  } else {
    if (req.path.startsWith("/client")) {
      res.status(403).json({ message: "Admin privileges required" });
    } else {
      res.redirect("/auth/login");
    }
  }
};

exports.userAuthorization = (req, res, next) => {
  const isAuthenticated = req.user && req.isAuthenticated();

  if (isAuthenticated && (req.user.method === "local" || "google")) {
    next();
  } else {
    res.status(401).json({ message: "User authentication required" });
  }
};
