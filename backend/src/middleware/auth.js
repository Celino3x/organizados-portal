const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'organizados_secret_key';

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

exports.authorize = (...levels) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!levels.includes(req.user.accessLevel) && req.user.accessLevel !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    next();
  };
};