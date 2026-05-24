const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from request header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    // Verify token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // attach user info to request
    next();              // move to the next function
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};