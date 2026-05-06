const Joi = require('joi');
const {
  Docente,
  Persona,
  DocenteAsignaturaGrupo,
  Asignatura,
  Grupo,
  AnioLectivo,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_persona: Joi.number().integer().required(),
  especialidad: Joi.string().max(100).allow(null, '').optional(),
  activo: Joi.boolean().optional(),
});

const validadorActualizar = Joi.object({
  id_persona: Joi.number().integer().optional(),
  especialidad: Joi.string().max(100).allow(null, '').optional(),
  activo: Joi.boolean().optional(),
});

const crearRegistro = async (req, res) => {
  try {
    const { error } = validadorCrear.validate(req.body, { abortEarly: false });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');

      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: {
          erroresValidacion: mensajesErrores,
        },
      });
    }

    const nuevo = await Docente.create(req.body);

    return res.status(201).json({
      mensaje: 'Docente creado',
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
    const registros = await Docente.findAll({
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Docentes listados',
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

    const registro = await Docente.findByPk(id, {
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
        {
          model: DocenteAsignaturaGrupo,
          as: 'asignaciones',
          required: false,
          include: [
            {
              model: Asignatura,
              as: 'asignatura',
              required: false,
            },
            {
              model: Grupo,
              as: 'grupo',
              required: false,
            },
            {
              model: AnioLectivo,
              as: 'anioLectivo',
              required: false,
            },
          ],
        },
      ],
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Docente no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Docente encontrado',
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
        resultado: {
          erroresValidacion: mensajesErrores,
        },
      });
    }

    const { id } = req.params;

    const registro = await Docente.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Docente no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Docente actualizado',
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

    const registro = await Docente.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Docente no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Docente eliminado',
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
