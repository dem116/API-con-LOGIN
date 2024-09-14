const jwt = require('jsonwebtoken');
const hashedSecret = require('../crypto/crypto');

const generateToken = (user) => {
  return jwt.sign({ user: user.id }, hashedSecret, {
    expiresIn: '1h',
  });
};

const verifyToken = (req, res, next) => {
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ mensaje: 'No se ha generado el token' });
  }
  jwt.verify(token, hashedSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token no válido' });
    }
    req.user = decoded.user;
    next();
  });
};

module.exports = { generateToken, verifyToken };
