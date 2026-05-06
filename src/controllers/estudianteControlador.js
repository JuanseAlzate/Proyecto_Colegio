const Joi = require('joi');
const {
  Estudiante,
  Persona,
  Acudiente,
  Matricula,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_persona: Joi.number().integer().required(),
  id_acudiente: Joi.number().integer().required(),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO', 'RETIRADO').optional(),
  fecha_ingreso: Joi.date().required(),
});

const validadorActualizar = Joi.object({
  id_persona: Joi.number().integer().optional(),
  id_acudiente: Joi.number().integer().optional(),
  estado: Joi.string().valid('ACTIVO', 'INACTIVO', 'RETIRADO').optional(),
  fecha_ingreso: Joi.date().optional(),
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

    const nuevo = await Estudiante.create(req.body);

    return res.status(201).json({
      mensaje: 'Estudiante creado',
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
    const registros = await Estudiante.findAll({
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
        {
          model: Acudiente,
          as: 'acudiente',
          required: false,
          include: [
            {
              model: Persona,
              as: 'persona',
              required: false,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Estudiantes listados',
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

    const registro = await Estudiante.findByPk(id, {
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
        {
          model: Acudiente,
          as: 'acudiente',
          required: false,
          include: [
            {
              model: Persona,
              as: 'persona',
              required: false,
            },
          ],
        },
        {
          model: Matricula,
          as: 'matriculas',
          required: false,
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Estudiante encontrado',
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

    const registro = await Estudiante.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Estudiante actualizado',
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

    const registro = await Estudiante.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    await registro.update({
      estado: 'RETIRADO',
    });

    await Matricula.update(
      {
        estado: 'RETIRADO',
      },
      {
        where: {
          id_estudiante: id,
        },
      },
    );

    return res.status(200).json({
      mensaje: 'Estudiante retirado correctamente',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarAcudientesEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await Estudiante.findByPk(id, {
      include: [
        {
          model: Acudiente,
          as: 'acudiente',
          required: false,
          include: [
            {
              model: Persona,
              as: 'persona',
              required: false,
            },
          ],
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Acudiente del estudiante listado',
      resultado: estudiante.acudiente ? [estudiante.acudiente] : [],
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
  listarAcudientesEstudiante,
};
