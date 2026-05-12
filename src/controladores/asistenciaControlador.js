const Joi = require('joi');
const { Op } = require('sequelize');

const {
  AsistenciaDiaria,
  Matricula,
  Estudiante,
  Persona,
  Grupo,
  Grado,
  AnioLectivo,
  Docente,
  DocenteAsignaturaGrupo,
  ConfiguracionSistema,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_matricula: Joi.number().integer().required(),
  fecha: Joi.date().required(),
  estado: Joi.string()
    .valid('PRESENTE', 'AUSENTE_JUSTIFICADO', 'AUSENTE_INJUSTIFICADO')
    .required(),
});

const validadorActualizar = Joi.object({
  fecha: Joi.date().optional(),
  estado: Joi.string()
    .valid('PRESENTE', 'AUSENTE_JUSTIFICADO', 'AUSENTE_INJUSTIFICADO')
    .optional(),
});

const esFechaFutura = (fecha) => {
  const fechaEntrada = new Date(fecha);
  const hoy = new Date();

  fechaEntrada.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  return fechaEntrada > hoy;
};

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

const verificarDocenteAsignadoAGrupo = async ({
  id_docente,
  id_grupo,
  id_anio_lectivo,
}) => {
  const asignacion = await DocenteAsignaturaGrupo.findOne({
    where: {
      id_docente,
      id_grupo,
      id_anio_lectivo,
    },
  });

  return asignacion;
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

    const { id_matricula, fecha } = req.body;

    if (esFechaFutura(fecha)) {
      return res.status(400).json({
        mensaje: 'No se puede registrar asistencia con fecha futura',
        resultado: null,
      });
    }

    const docente = await obtenerDocenteAutenticado(req);

    if (!docente) {
      return res.status(403).json({
        mensaje: 'No existe un docente activo asociado al usuario autenticado',
        resultado: null,
      });
    }

    const matricula = await Matricula.findByPk(id_matricula);

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const asignacion = await verificarDocenteAsignadoAGrupo({
      id_docente: docente.id_docente,
      id_grupo: matricula.id_grupo,
      id_anio_lectivo: matricula.id_anio_lectivo,
    });

    if (!asignacion) {
      return res.status(403).json({
        mensaje: 'El docente no tiene asignado el grupo de esta matricula',
        resultado: {
          id_docente: docente.id_docente,
          id_grupo: matricula.id_grupo,
          id_anio_lectivo: matricula.id_anio_lectivo,
        },
      });
    }

    const nuevo = await AsistenciaDiaria.create({
      ...req.body,
      id_docente_registro: docente.id_docente,
    });

    return res.status(201).json({
      mensaje: 'Asistencia registrada correctamente',
      resultado: nuevo,
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

    const asistencia = await AsistenciaDiaria.findByPk(id);

    if (!asistencia) {
      return res.status(404).json({
        mensaje: 'Asistencia no encontrada',
        resultado: null,
      });
    }

    const fechaFinal = req.body.fecha || asistencia.fecha;

    if (esFechaFutura(fechaFinal)) {
      return res.status(400).json({
        mensaje: 'No se puede actualizar asistencia con fecha futura',
        resultado: null,
      });
    }

    const docente = await obtenerDocenteAutenticado(req);

    if (!docente) {
      return res.status(403).json({
        mensaje: 'No existe un docente activo asociado al usuario autenticado',
        resultado: null,
      });
    }

    const matricula = await Matricula.findByPk(asistencia.id_matricula);

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const asignacion = await verificarDocenteAsignadoAGrupo({
      id_docente: docente.id_docente,
      id_grupo: matricula.id_grupo,
      id_anio_lectivo: matricula.id_anio_lectivo,
    });

    if (!asignacion) {
      return res.status(403).json({
        mensaje: 'El docente no tiene asignado el grupo de esta matricula',
        resultado: {
          id_docente: docente.id_docente,
          id_grupo: matricula.id_grupo,
          id_anio_lectivo: matricula.id_anio_lectivo,
        },
      });
    }

    await asistencia.update({
      ...req.body,
      id_docente_registro: docente.id_docente,
    });

    return res.status(200).json({
      mensaje: 'Asistencia actualizada correctamente',
      resultado: asistencia,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarPorGrupoFecha = async (req, res) => {
  try {
    const { id_grupo, fecha } = req.params;

    const grupo = await Grupo.findByPk(id_grupo, {
      include: [
        {
          model: Grado,
          as: 'grado',
          required: false,
        },
      ],
    });

    if (!grupo) {
      return res.status(404).json({
        mensaje: 'Grupo no encontrado',
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

      const asignacion = await verificarDocenteAsignadoAGrupo({
        id_docente: docente.id_docente,
        id_grupo,
        id_anio_lectivo: grupo.id_anio_lectivo,
      });

      if (!asignacion) {
        return res.status(403).json({
          mensaje:
            'El docente no tiene permiso para consultar asistencia de este grupo',
          resultado: null,
        });
      }
    }

    const matriculas = await Matricula.findAll({
      where: {
        id_grupo,
      },
    });

    const idsMatriculas = matriculas.map((matricula) => matricula.id_matricula);

    const asistencias = await AsistenciaDiaria.findAll({
      where: {
        fecha,
        id_matricula: {
          [Op.in]: idsMatriculas,
        },
      },
      include: [
        {
          model: Matricula,
          as: 'matricula',
          required: false,
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
          ],
        },
        {
          model: Docente,
          as: 'docenteRegistro',
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
      order: [['id_matricula', 'ASC']],
    });

    return res.status(200).json({
      mensaje: 'Asistencia del grupo en la fecha listada',
      resultado: {
        grupo,
        fecha,
        asistencias,
      },
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
    const { id_matricula } = req.params;

    const matricula = await Matricula.findByPk(id_matricula, {
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

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
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

      const asignacion = await verificarDocenteAsignadoAGrupo({
        id_docente: docente.id_docente,
        id_grupo: matricula.id_grupo,
        id_anio_lectivo: matricula.id_anio_lectivo,
      });

      if (!asignacion) {
        return res.status(403).json({
          mensaje:
            'El docente no tiene permiso para consultar asistencia de este estudiante',
          resultado: null,
        });
      }
    }

    const asistencias = await AsistenciaDiaria.findAll({
      where: {
        id_matricula,
      },
      include: [
        {
          model: Docente,
          as: 'docenteRegistro',
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
      order: [['fecha', 'DESC']],
    });

    return res.status(200).json({
      mensaje: 'Historial de asistencia del estudiante listado',
      resultado: {
        matricula,
        asistencias,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarAlertasInasistencia = async (req, res) => {
  try {
    const { id_anio } = req.params;

    const anioLectivo = await AnioLectivo.findByPk(id_anio);

    if (!anioLectivo) {
      return res.status(404).json({
        mensaje: 'Año lectivo no encontrado',
        resultado: null,
      });
    }

    const configuracionUmbral = await ConfiguracionSistema.findByPk(
      'umbral_inasistencias',
    );

    const umbral = configuracionUmbral
      ? parseFloat(configuracionUmbral.valor)
      : 0.25;

    const matriculas = await Matricula.findAll({
      where: {
        id_anio_lectivo: id_anio,
        estado: 'ACTIVA',
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
    });

    const alertas = [];

    for (const matricula of matriculas) {
      if (req.usuario.rol === 'DOCENTE') {
        const docente = await obtenerDocenteAutenticado(req);

        if (!docente) {
          return res.status(403).json({
            mensaje:
              'No existe un docente activo asociado al usuario autenticado',
            resultado: null,
          });
        }

        const asignacion = await verificarDocenteAsignadoAGrupo({
          id_docente: docente.id_docente,
          id_grupo: matricula.id_grupo,
          id_anio_lectivo: matricula.id_anio_lectivo,
        });

        if (!asignacion) {
          continue;
        }
      }

      const asistencias = await AsistenciaDiaria.findAll({
        where: {
          id_matricula: matricula.id_matricula,
        },
      });

      const totalRegistros = asistencias.length;

      if (totalRegistros === 0) {
        continue;
      }

      const totalInasistencias = asistencias.filter(
        (asistencia) =>
          asistencia.estado === 'AUSENTE_JUSTIFICADO' ||
          asistencia.estado === 'AUSENTE_INJUSTIFICADO',
      ).length;

      const porcentajeInasistencia = totalInasistencias / totalRegistros;

      if (porcentajeInasistencia > umbral) {
        alertas.push({
          matricula,
          totalRegistros,
          totalInasistencias,
          porcentajeInasistencia: Number(porcentajeInasistencia.toFixed(4)),
          umbral,
        });
      }
    }

    return res.status(200).json({
      mensaje: 'Alertas de inasistencia listadas',
      resultado: {
        anioLectivo,
        umbral,
        alertas,
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
  listarPorGrupoFecha,
  listarPorEstudiante,
  listarAlertasInasistencia,
};
