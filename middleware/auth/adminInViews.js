// makes information about the admin’s authentication status and admin
// information available in the views
module.exports = (req, res, next) => {
  if (req.user && req.user.admin === true) {
    res.locals.adminAuth = req.isAuthenticated();
    res.locals.adminInfo = req.user;
  } else {
    res.locals.adminAuth = null;
    res.locals.adminInfo = null;
  }

  next();
};
