const Joi = require('joi');
const {
  DocenteAsignaturaGrupo,
  Docente,
  Persona,
  Asignatura,
  Grupo,
  Grado,
  AnioLectivo,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_docente: Joi.number().integer().required(),
  id_asignatura: Joi.number().integer().required(),
  id_grupo: Joi.number().integer().required(),
  id_anio_lectivo: Joi.number().integer().required(),
});

const validadorActualizar = Joi.object({
  id_docente: Joi.number().integer().optional(),
  id_asignatura: Joi.number().integer().optional(),
  id_grupo: Joi.number().integer().optional(),
  id_anio_lectivo: Joi.number().integer().optional(),
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

    const nuevo = await DocenteAsignaturaGrupo.create(req.body);

    return res.status(201).json({
      mensaje: 'Asignacion de docente creada',
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
    const registros = await DocenteAsignaturaGrupo.findAll({
      include: [
        {
          model: Docente,
          as: 'docente',
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
          model: Asignatura,
          as: 'asignatura',
          required: false,
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
      mensaje: 'Asignaciones de docente listadas',
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
    const { id_docente, id_asignatura, id_grupo, id_anio_lectivo } = req.params;

    const registro = await DocenteAsignaturaGrupo.findOne({
      where: {
        id_docente,
        id_asignatura,
        id_grupo,
        id_anio_lectivo,
      },
      include: [
        {
          model: Docente,
          as: 'docente',
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
          model: Asignatura,
          as: 'asignatura',
          required: false,
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
        mensaje: 'Asignacion de docente no encontrada',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Asignacion de docente encontrada',
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

    const { id_docente, id_asignatura, id_grupo, id_anio_lectivo } = req.params;

    const registro = await DocenteAsignaturaGrupo.findOne({
      where: {
        id_docente,
        id_asignatura,
        id_grupo,
        id_anio_lectivo,
      },
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Asignacion de docente no encontrada',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Asignacion de docente actualizada',
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
    const { id_docente, id_asignatura, id_grupo, id_anio_lectivo } = req.params;

    const registro = await DocenteAsignaturaGrupo.findOne({
      where: {
        id_docente,
        id_asignatura,
        id_grupo,
        id_anio_lectivo,
      },
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Asignacion de docente no encontrada',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Asignacion de docente eliminada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarPorDocente = async (req, res) => {
  try {
    const { id_docente } = req.params;

    const docente = await Docente.findByPk(id_docente, {
      include: [
        {
          model: Persona,
          as: 'persona',
          required: false,
        },
      ],
    });

    if (!docente) {
      return res.status(404).json({
        mensaje: 'Docente no encontrado',
        resultado: null,
      });
    }

    const asignaciones = await DocenteAsignaturaGrupo.findAll({
      where: {
        id_docente,
      },
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
      mensaje: 'Asignaciones del docente listadas',
      resultado: {
        docente,
        asignaciones,
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
  listarPorDocente,
};
