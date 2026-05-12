const Joi = require('joi');
const {
  Periodo,
  Matricula,
  Grupo,
  GradoAsignatura,
  ComponenteCalificacion,
  NotaComponente,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_anio_lectivo: Joi.number().integer().required(),
  numero: Joi.number().integer().min(1).max(4).required(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().required(),
  cerrado: Joi.boolean().optional(),
  observaciones: Joi.string().allow(null, '').optional(),
});

const validadorActualizar = Joi.object({
  id_anio_lectivo: Joi.number().integer().optional(),
  numero: Joi.number().integer().min(1).max(4).optional(),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().optional(),
  cerrado: Joi.boolean().optional(),
  observaciones: Joi.string().allow(null, '').optional(),
});

const validadorReabrir = Joi.object({
  motivo: Joi.string().min(5).required(),
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

    const nuevo = await Periodo.create(req.body);

    return res.status(201).json({
      mensaje: 'Periodo creado',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await Periodo.findAll();

    return res.status(200).json({
      mensaje: 'Periodos listados',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Periodo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Periodo encontrado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
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

    const registro = await Periodo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Periodo actualizado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Periodo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Periodo eliminado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const verificarNotasCompletasPeriodo = async (id_periodo) => {
  const periodo = await Periodo.findByPk(id_periodo);

  if (!periodo) {
    return {
      valido: false,
      status: 404,
      mensaje: 'Periodo no encontrado',
      resultado: null,
    };
  }

  const matriculas = await Matricula.findAll({
    where: {
      id_anio_lectivo: periodo.id_anio_lectivo,
      estado: 'ACTIVA',
    },
    include: [
      {
        model: Grupo,
        as: 'grupo',
        required: true,
      },
    ],
  });

  const pendientes = [];

  for (const matricula of matriculas) {
    const idGrado = matricula.grupo.id_grado;

    const gradosAsignaturas = await GradoAsignatura.findAll({
      where: {
        id_grado: idGrado,
      },
    });

    for (const gradoAsignatura of gradosAsignaturas) {
      const componentes = await ComponenteCalificacion.findAll({
        where: {
          id_asignatura: gradoAsignatura.id_asignatura,
          id_anio_lectivo: periodo.id_anio_lectivo,
        },
      });

      for (const componente of componentes) {
        const nota = await NotaComponente.findOne({
          where: {
            id_matricula: matricula.id_matricula,
            id_componente: componente.id_componente,
            id_periodo,
          },
        });

        if (!nota) {
          pendientes.push({
            id_matricula: matricula.id_matricula,
            id_estudiante: matricula.id_estudiante,
            id_grupo: matricula.id_grupo,
            id_asignatura: gradoAsignatura.id_asignatura,
            id_componente: componente.id_componente,
            componente: componente.nombre,
          });
        }
      }
    }
  }

  if (pendientes.length > 0) {
    return {
      valido: false,
      status: 400,
      mensaje: 'No se puede cerrar el periodo porque existen notas pendientes',
      resultado: {
        totalPendientes: pendientes.length,
        pendientes,
      },
    };
  }

  return {
    valido: true,
    status: 200,
    mensaje: 'Todas las notas estan completas',
    resultado: {
      totalPendientes: 0,
    },
  };
};

const cerrarPeriodo = async (req, res) => {
  try {
    const { id } = req.params;

    const periodo = await Periodo.findByPk(id);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    if (periodo.cerrado) {
      return res.status(400).json({
        mensaje: 'El periodo ya se encuentra cerrado',
        resultado: periodo,
      });
    }

    const validacionNotas = await verificarNotasCompletasPeriodo(id);

    if (!validacionNotas.valido) {
      return res.status(validacionNotas.status).json({
        mensaje: validacionNotas.mensaje,
        resultado: validacionNotas.resultado,
      });
    }

    await periodo.update({
      cerrado: true,
    });

    return res.status(200).json({
      mensaje: 'Periodo cerrado correctamente',
      resultado: periodo,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const reabrirPeriodo = async (req, res) => {
  try {
    const { error } = validadorReabrir.validate(req.body, {
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
    const { motivo } = req.body;

    const periodo = await Periodo.findByPk(id);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    if (!periodo.cerrado) {
      return res.status(400).json({
        mensaje: 'El periodo ya se encuentra abierto',
        resultado: periodo,
      });
    }

    const observacionesActuales = periodo.observaciones || '';

    const nuevaObservacion = [
      observacionesActuales,
      `Reapertura realizada por usuario ${req.usuario.username}. Motivo: ${motivo}. Fecha: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    await periodo.update({
      cerrado: false,
      observaciones: nuevaObservacion,
    });

    return res.status(200).json({
      mensaje: 'Periodo reabierto correctamente',
      resultado: periodo,
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
  cerrarPeriodo,
  reabrirPeriodo,
};
