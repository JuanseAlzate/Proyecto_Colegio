const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const headerAutorizacion = req.headers.authorization;

    if (!headerAutorizacion) {
      return res.status(401).json({
        mensaje: 'Token no proporcionado',
        resultado: null,
      });
    }

    const partesToken = headerAutorizacion.split(' ');

    if (partesToken.length !== 2 || partesToken[0] !== 'Bearer') {
      return res.status(401).json({
        mensaje: 'Formato de token invalido. Use Authorization: Bearer <token>',
        resultado: null,
      });
    }

    const token = partesToken[1];

    const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id_usuario: usuarioDecodificado.id_usuario,
      username: usuarioDecodificado.username,
      rol: usuarioDecodificado.rol,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'Token expirado',
        resultado: null,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        mensaje: 'Token invalido',
        resultado: null,
      });
    }

    return res.status(401).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const checkRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          mensaje: 'Usuario no autenticado',
          resultado: null,
        });
      }

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        return res.status(403).json({
          mensaje: 'No tiene permisos para acceder a este recurso',
          resultado: {
            rolUsuario: req.usuario.rol,
            rolesPermitidos,
          },
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        mensaje: error.message,
        resultado: null,
      });
    }
  };
};

module.exports = {
  verifyToken,
  checkRol,
};
