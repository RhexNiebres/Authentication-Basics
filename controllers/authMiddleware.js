module.exports.isAuthenticated = (req, res, next) => {
    if (req.user) return next();
    return res.status(401).send("Unauthorized");
  };
  
  module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.membership === "admin") return next();
    return res.status(403).send("Unauthorized");
  };
  