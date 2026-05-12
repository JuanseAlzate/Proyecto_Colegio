const Joi = require('joi');
const { Op } = require('sequelize');

const {
  Citacion,
  Estudiante,
  Acudiente,
  Docente,
  Persona,
  Matricula,
  Grupo,
  Grado,
  AnioLectivo,
  DocenteAsignaturaGrupo,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_estudiante: Joi.number().integer().required(),
  id_acudiente: Joi.number().integer().required(),
  fecha_generacion: Joi.date().required(),
  motivo: Joi.string()
    .valid('BAJO_RENDIMIENTO', 'INASISTENCIAS', 'COMPORTAMIENTO')
    .required(),
  observaciones: Joi.string().allow(null, '').optional(),
  estado: Joi.string()
    .valid('PENDIENTE', 'ATENDIDA', 'NO_ATENDIDA', 'CANCELADA')
    .optional(),
  fecha_atencion: Joi.date().allow(null).optional(),
  acta_resumen: Joi.string().allow(null, '').optional(),
});

const validadorActualizar = Joi.object({
  id_estudiante: Joi.number().integer().optional(),
  id_acudiente: Joi.number().integer().optional(),
  id_docente_genera: Joi.number().integer().optional(),
  fecha_generacion: Joi.date().optional(),
  motivo: Joi.string()
    .valid('BAJO_RENDIMIENTO', 'INASISTENCIAS', 'COMPORTAMIENTO')
    .optional(),
  observaciones: Joi.string().allow(null, '').optional(),
  estado: Joi.string()
    .valid('PENDIENTE', 'ATENDIDA', 'NO_ATENDIDA', 'CANCELADA')
    .optional(),
  fecha_atencion: Joi.date().allow(null).optional(),
  acta_resumen: Joi.string().allow(null, '').optional(),
});

const obtenerDocenteAutenticado = async (req) => {
  const persona = await Persona.findOne({
    where: {
      id_usuario: req.usuario.id_usuario,
    },
  });

  if (!persona) {
    return null;
  }

  const docente = await Docente.findOne({
    where: {
      id_persona: persona.id_persona,
      activo: true,
    },
  });

  return docente;
};

const obtenerAcudienteAutenticado = async (req) => {
  const persona = await Persona.findOne({
    where: {
      id_usuario: req.usuario.id_usuario,
    },
  });

  if (!persona) {
    return null;
  }

  const acudiente = await Acudiente.findOne({
    where: {
      id_persona: persona.id_persona,
    },
  });

  return acudiente;
};

const verificarDocentePuedeGestionarEstudiante = async ({
  id_docente,
  id_estudiante,
}) => {
  const matricula = await Matricula.findOne({
    where: {
      id_estudiante,
      estado: 'ACTIVA',
    },
  });

  if (!matricula) {
    return {
      permitido: false,
      mensaje: 'El estudiante no tiene una matricula activa',
      resultado: null,
    };
  }

  const asignacion = await DocenteAsignaturaGrupo.findOne({
    where: {
      id_docente,
      id_grupo: matricula.id_grupo,
      id_anio_lectivo: matricula.id_anio_lectivo,
    },
  });

  if (!asignacion) {
    return {
      permitido: false,
      mensaje: 'El docente no tiene asignado el grupo del estudiante',
      resultado: {
        id_docente,
        id_grupo: matricula.id_grupo,
        id_anio_lectivo: matricula.id_anio_lectivo,
      },
    };
  }

  return {
    permitido: true,
    mensaje: 'Docente autorizado',
    resultado: {
      matricula,
      asignacion,
    },
  };
};

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

    const docente = await obtenerDocenteAutenticado(req);

    if (!docente) {
      return res.status(403).json({
        mensaje: 'No existe un docente activo asociado al usuario autenticado',
        resultado: null,
      });
    }

    const { id_estudiante, id_acudiente } = req.body;

    const estudiante = await Estudiante.findByPk(id_estudiante);

    if (!estudiante) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
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

    if (Number(estudiante.id_acudiente) !== Number(id_acudiente)) {
      return res.status(400).json({
        mensaje: 'El acudiente no esta vinculado al estudiante',
        resultado: {
          id_acudiente_estudiante: estudiante.id_acudiente,
          id_acudiente_enviado: id_acudiente,
        },
      });
    }

    const validacionDocente = await verificarDocentePuedeGestionarEstudiante({
      id_docente: docente.id_docente,
      id_estudiante,
    });

    if (!validacionDocente.permitido) {
      return res.status(403).json({
        mensaje: validacionDocente.mensaje,
        resultado: validacionDocente.resultado,
      });
    }

    const nuevaCitacion = await Citacion.create({
      ...req.body,
      id_docente_genera: docente.id_docente,
    });

    return res.status(201).json({
      mensaje: 'Citacion creada correctamente',
      resultado: nuevaCitacion,
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

    const citacion = await Citacion.findByPk(id);

    if (!citacion) {
      return res.status(404).json({
        mensaje: 'Citacion no encontrada',
        resultado: null,
      });
    }

    await citacion.update(req.body);

    return res.status(200).json({
      mensaje: 'Citacion actualizada correctamente',
      resultado: citacion,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarPorEstudiante = async (req, res) => {
  try {
    const { id_estudiante } = req.params;

    const estudiante = await Estudiante.findByPk(id_estudiante, {
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

    if (!estudiante) {
      return res.status(404).json({
        mensaje: 'Estudiante no encontrado',
        resultado: null,
      });
    }

    if (req.usuario.rol === 'DOCENTE') {
      const docente = await obtenerDocenteAutenticado(req);

      if (!docente) {
        return res.status(403).json({
          mensaje:
            'No existe un docente activo asociado al usuario autenticado',
          resultado: null,
        });
      }

      const validacionDocente = await verificarDocentePuedeGestionarEstudiante({
        id_docente: docente.id_docente,
        id_estudiante,
      });

      if (!validacionDocente.permitido) {
        return res.status(403).json({
          mensaje:
            'El docente no tiene permiso para consultar citaciones de este estudiante',
          resultado: validacionDocente.resultado,
        });
      }
    }

    if (req.usuario.rol === 'ACUDIENTE') {
      const acudiente = await obtenerAcudienteAutenticado(req);

      if (!acudiente) {
        return res.status(403).json({
          mensaje: 'No existe un acudiente asociado al usuario autenticado',
          resultado: null,
        });
      }

      if (Number(estudiante.id_acudiente) !== Number(acudiente.id_acudiente)) {
        return res.status(403).json({
          mensaje:
            'El acudiente no tiene permiso para consultar citaciones de este estudiante',
          resultado: null,
        });
      }
    }

    const citaciones = await Citacion.findAll({
      where: {
        id_estudiante,
      },
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
        {
          model: Docente,
          as: 'docenteGenera',
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
      order: [['fecha_generacion', 'DESC']],
    });

    return res.status(200).json({
      mensaje: 'Citaciones del estudiante listadas',
      resultado: {
        estudiante,
        citaciones,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarPendientes = async (req, res) => {
  try {
    const citaciones = await Citacion.findAll({
      where: {
        estado: 'PENDIENTE',
      },
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
              model: Matricula,
              as: 'matriculas',
              required: false,
              include: [
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
              ],
            },
          ],
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
          model: Docente,
          as: 'docenteGenera',
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
      order: [['fecha_generacion', 'ASC']],
    });

    return res.status(200).json({
      mensaje: 'Citaciones pendientes listadas',
      resultado: citaciones,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarMesActual = async (req, res) => {
  try {
    const fechaActual = new Date();

    const primerDiaMes = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      1,
    );

    const ultimoDiaMes = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() + 1,
      0,
    );

    const fechaInicio = primerDiaMes.toISOString().split('T')[0];
    const fechaFin = ultimoDiaMes.toISOString().split('T')[0];

    const citaciones = await Citacion.findAll({
      where: {
        fecha_generacion: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
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
          ],
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
          model: Docente,
          as: 'docenteGenera',
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
      order: [['fecha_generacion', 'DESC']],
    });

    const conteoPorEstado = {
      PENDIENTE: 0,
      ATENDIDA: 0,
      NO_ATENDIDA: 0,
      CANCELADA: 0,
    };

    citaciones.forEach((citacion) => {
      conteoPorEstado[citacion.estado] += 1;
    });

    return res.status(200).json({
      mensaje: 'Citaciones del mes actual listadas',
      resultado: {
        fechaInicio,
        fechaFin,
        conteoPorEstado,
        total: citaciones.length,
        citaciones,
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
  actualizarRegistro,
  listarPorEstudiante,
  listarPendientes,
  listarMesActual,
};
