const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Usuario } = require('../baseDatos/index');

const validadorLogin = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'El username es obligatorio',
    'string.min': 'El username debe tener minimo 3 caracteres',
    'string.max': 'El username debe tener maximo 50 caracteres',
    'any.required': 'El username es obligatorio',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'La password es obligatoria',
    'string.min': 'La password debe tener minimo 6 caracteres',
    'string.max': 'La password debe tener maximo 100 caracteres',
    'any.required': 'La password es obligatoria',
  }),
});

const login = async (req, res) => {
  try {
    const { error } = validadorLogin.validate(req.body, { abortEarly: false });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');

      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: {
          erroresValidacion: mensajesErrores,
        },
      });
    }

    const { username, password } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        username,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Credenciales invalidas',
        resultado: null,
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: 'El usuario se encuentra inactivo',
        resultado: null,
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Credenciales invalidas',
        resultado: null,
      });
    }

    const payload = {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    await usuario.update({
      ultimo_acceso: new Date(),
    });

    return res.status(200).json({
      mensaje: 'Inicio de sesion exitoso',
      resultado: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          rol: usuario.rol,
          activo: usuario.activo,
          ultimo_acceso: usuario.ultimo_acceso,
        },
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      mensaje: 'Cierre de sesion exitoso',
      resultado: {
        usuario: req.usuario || null,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

module.exports = {
  login,
  logout,
};
