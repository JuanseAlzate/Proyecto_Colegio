const Joi = require('joi');
const { Persona, Usuario } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  nombre: Joi.string().max(100).required(),
  apellidos: Joi.string().max(100).required(),
  fecha_nacimiento: Joi.date().required(),
  genero: Joi.string().valid('MASCULINO', 'FEMENINO', 'OTRO').required(),
  direccion: Joi.string().max(255).allow(null, '').optional(),
  telefono: Joi.string().max(20).allow(null, '').optional(),
  email: Joi.string().email().max(100).required(),
  id_usuario: Joi.number().integer().allow(null).optional(),
});

const validadorActualizar = Joi.object({
  nombre: Joi.string().max(100).optional(),
  apellidos: Joi.string().max(100).optional(),
  fecha_nacimiento: Joi.date().optional(),
  genero: Joi.string().valid('MASCULINO', 'FEMENINO', 'OTRO').optional(),
  direccion: Joi.string().max(255).allow(null, '').optional(),
  telefono: Joi.string().max(20).allow(null, '').optional(),
  email: Joi.string().email().max(100).optional(),
  id_usuario: Joi.number().integer().allow(null).optional(),
});

const crearRegistro = async (req, res) => {
  try {
    const { error } = validadorCrear.validate(req.body, { abortEarly: false });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');
      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: { erroresValidacion: mensajesErrores },
      });
    }

    const nuevo = await Persona.create(req.body);

    return res.status(201).json({
      mensaje: 'Persona creada',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await Persona.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          required: false,
          attributes: [
            'id_usuario',
            'username',
            'rol',
            'activo',
            'ultimo_acceso',
            'created_at',
          ],
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Personas listadas',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Persona.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          required: false,
          attributes: [
            'id_usuario',
            'username',
            'rol',
            'activo',
            'ultimo_acceso',
            'created_at',
          ],
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Persona no encontrada',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Persona encontrada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const actualizarRegistro = async (req, res) => {
  try {
    const { error } = validadorActualizar.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');
      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: { erroresValidacion: mensajesErrores },
      });
    }

    const { id } = req.params;

    const registro = await Persona.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Persona no encontrada',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Persona actualizada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Persona.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Persona no encontrada',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Persona eliminada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

module.exports = {
  crearRegistro,
  listarRegistros,
  obtenerRegistro,
  actualizarRegistro,
  borrarRegistro,
};
