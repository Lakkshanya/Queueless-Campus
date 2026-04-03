import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = { id: user._id, name: user.name, role: user.role };
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

export const staffAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Staff only.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Requires one of roles: ${roles.join(', ')}` });
    }
  };
};

// Aliases for compatibility with different route implementations
export const verifyToken = auth;
export const isAdmin = adminAuth;
export const isStaff = staffAuth;
