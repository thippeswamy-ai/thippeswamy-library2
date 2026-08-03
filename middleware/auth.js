const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  const token = authHeader.split(' ')[1] || authHeader;
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'arts_college_anantapur_secret_key_2026');
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Permission Denied: Super Admin Access Required' });
  }
};

module.exports = { verifyToken, requireSuperAdmin };
