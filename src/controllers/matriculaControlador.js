const Joi = require('joi');
const {
  Matricula,
  Estudiante,
  Persona,
  Grupo,
  Grado,
  AnioLectivo,
  Acudiente,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_estudiante: Joi.number().integer().required(),
  id_grupo: Joi.number().integer().required(),
  id_anio_lectivo: Joi.number().integer().required(),
  fecha_matricula: Joi.date().required(),
  estado: Joi.string().valid('ACTIVA', 'RETIRADO').optional(),
});

const validadorActualizar = Joi.object({
  id_estudiante: Joi.number().integer().optional(),
  id_grupo: Joi.number().integer().optional(),
  id_anio_lectivo: Joi.number().integer().optional(),
  fecha_matricula: Joi.date().optional(),
  estado: Joi.string().valid('ACTIVA', 'RETIRADO').optional(),
});

const validadorVincularAcudiente = Joi.object({
  id_acudiente: Joi.number().integer().required(),
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

    const nuevo = await Matricula.create(req.body);

    return res.status(201).json({
      mensaje: 'Matricula creada',
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
    const registros = await Matricula.findAll({
      include: [
        {
          model: Estudiante,
          as: 'estudiante',
          required: false,
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
        },
        {
          model: Grupo,
          as: 'grupo',
          required: false,
          include: [
            {
              model: Grado,
              as: 'grado',
              required: false,
            },
          ],
        },
        {
          model: AnioLectivo,
          as: 'anioLectivo',
          required: false,
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Matriculas listadas',
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

    const registro = await Matricula.findByPk(id, {
      include: [
        {
          model: Estudiante,
          as: 'estudiante',
          required: false,
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
        },
        {
          model: Grupo,
          as: 'grupo',
          required: false,
          include: [
            {
              model: Grado,
              as: 'grado',
              required: false,
            },
          ],
        },
        {
          model: AnioLectivo,
          as: 'anioLectivo',
          required: false,
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Matricula encontrada',
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

    const registro = await Matricula.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Matricula actualizada',
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

    const registro = await Matricula.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    await registro.update({
      estado: 'RETIRADO',
    });

    return res.status(200).json({
      mensaje: 'Matricula retirada correctamente',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const vincularAcudiente = async (req, res) => {
  try {
    const { error } = validadorVincularAcudiente.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');
      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: { erroresValidacion: mensajesErrores },
      });
    }

    const { id_matricula } = req.params;
    const { id_acudiente } = req.body;

    const matricula = await Matricula.findByPk(id_matricula);

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const acudiente = await Acudiente.findByPk(id_acudiente);

    if (!acudiente) {
      return res.status(404).json({
        mensaje: 'Acudiente no encontrado',
        resultado: null,
      });
    }

    const estudiante = await Estudiante.findByPk(matricula.id_estudiante);

    if (!estudiante) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    await estudiante.update({
      id_acudiente,
    });

    return res.status(200).json({
      mensaje: 'Acudiente vinculado al estudiante de la matricula',
      resultado: {
        matricula,
        estudiante,
        acudiente,
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
  crearRegistro,
  listarRegistros,
  obtenerRegistro,
  actualizarRegistro,
  borrarRegistro,
  vincularAcudiente,
};
