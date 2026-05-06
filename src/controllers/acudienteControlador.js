const Joi = require('joi');
const { Acudiente, Persona, Estudiante } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_persona: Joi.number().integer().required(),
  parentesco: Joi.string().valid('PADRE', 'MADRE', 'TUTOR', 'OTRO').required(),
});

const validadorActualizar = Joi.object({
  id_persona: Joi.number().integer().optional(),
  parentesco: Joi.string().valid('PADRE', 'MADRE', 'TUTOR', 'OTRO').optional(),
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

    const nuevo = await Acudiente.create(req.body);

    return res.status(201).json({
      mensaje: 'Acudiente creado',
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
    const registros = await Acudiente.findAll({
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Acudientes listados',
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

    const registro = await Acudiente.findByPk(id, {
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
        {
          model: Estudiante,
          as: 'estudiantes',
          required: false,
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Acudiente no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Acudiente encontrado',
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

    const registro = await Acudiente.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Acudiente no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Acudiente actualizado',
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

    const registro = await Acudiente.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Acudiente no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Acudiente eliminado',
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
