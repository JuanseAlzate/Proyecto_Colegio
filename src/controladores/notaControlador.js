const Joi = require('joi');
const { Op } = require('sequelize');

const {
  NotaComponente,
  ComponenteCalificacion,
  Matricula,
  Periodo,
  DocenteAsignaturaGrupo,
  Docente,
  Persona,
  Estudiante,
  Grupo,
  Grado,
  Asignatura,
  AnioLectivo,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_matricula: Joi.number().integer().required(),
  id_componente: Joi.number().integer().required(),
  id_periodo: Joi.number().integer().required(),
  valor: Joi.number().min(1).max(5).required(),
  fecha_registro: Joi.date().required(),
});

const validadorActualizar = Joi.object({
  id_matricula: Joi.number().integer().optional(),
  id_componente: Joi.number().integer().optional(),
  id_periodo: Joi.number().integer().optional(),
  valor: Joi.number().min(1).max(5).optional(),
  fecha_registro: Joi.date().optional(),
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

const verificarPeriodoAbierto = async (id_periodo) => {
  const periodo = await Periodo.findByPk(id_periodo);

  if (!periodo) {
    return {
      valido: false,
      status: 404,
      mensaje: 'Periodo no encontrado',
      periodo: null,
    };
  }

  if (periodo.cerrado) {
    return {
      valido: false,
      status: 403,
      mensaje:
        'No se pueden registrar o modificar notas porque el periodo esta cerrado',
      periodo,
    };
  }

  return {
    valido: true,
    status: 200,
    mensaje: 'Periodo abierto',
    periodo,
  };
};

const verificarDocenteAsignado = async ({
  id_docente,
  id_matricula,
  id_componente,
}) => {
  const matricula = await Matricula.findByPk(id_matricula, {
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
      {
        model: AnioLectivo,
        as: 'anioLectivo',
        required: false,
      },
    ],
  });

  if (!matricula) {
    return {
      valido: false,
      status: 404,
      mensaje: 'Matricula no encontrada',
      resultado: null,
    };
  }

  const componente = await ComponenteCalificacion.findByPk(id_componente, {
    include: [
      {
        model: Asignatura,
        as: 'asignatura',
        required: false,
      },
    ],
  });

  if (!componente) {
    return {
      valido: false,
      status: 404,
      mensaje: 'Componente de calificacion no encontrado',
      resultado: null,
    };
  }

  if (
    Number(componente.id_anio_lectivo) !== Number(matricula.id_anio_lectivo)
  ) {
    return {
      valido: false,
      status: 400,
      mensaje:
        'El componente no pertenece al mismo año lectivo de la matricula',
      resultado: {
        id_anio_matricula: matricula.id_anio_lectivo,
        id_anio_componente: componente.id_anio_lectivo,
      },
    };
  }

  const asignacion = await DocenteAsignaturaGrupo.findOne({
    where: {
      id_docente,
      id_asignatura: componente.id_asignatura,
      id_grupo: matricula.id_grupo,
      id_anio_lectivo: matricula.id_anio_lectivo,
    },
  });

  if (!asignacion) {
    return {
      valido: false,
      status: 403,
      mensaje:
        'El docente no tiene asignada esta asignatura en el grupo del estudiante',
      resultado: {
        id_docente,
        id_asignatura: componente.id_asignatura,
        id_grupo: matricula.id_grupo,
        id_anio_lectivo: matricula.id_anio_lectivo,
      },
    };
  }

  return {
    valido: true,
    status: 200,
    mensaje: 'Docente autorizado',
    resultado: {
      matricula,
      componente,
      asignacion,
    },
  };
};

const calcularNotaDefinitiva = async (
  id_matricula,
  id_asignatura,
  id_periodo,
) => {
  const matricula = await Matricula.findByPk(id_matricula);

  if (!matricula) {
    throw new Error('Matricula no encontrada');
  }

  const periodo = await Periodo.findByPk(id_periodo);

  if (!periodo) {
    throw new Error('Periodo no encontrado');
  }

  const componentes = await ComponenteCalificacion.findAll({
    where: {
      id_asignatura,
      id_anio_lectivo: matricula.id_anio_lectivo,
    },
  });

  const idsComponentes = componentes.map(
    (componente) => componente.id_componente,
  );

  if (idsComponentes.length === 0) {
    return 0;
  }

  const notas = await NotaComponente.findAll({
    where: {
      id_matricula,
      id_periodo,
      id_componente: {
        [Op.in]: idsComponentes,
      },
    },
  });

  let definitiva = 0;

  componentes.forEach((componente) => {
    const nota = notas.find(
      (notaComponente) =>
        Number(notaComponente.id_componente) ===
        Number(componente.id_componente),
    );

    if (nota) {
      definitiva += parseFloat(nota.valor) * parseFloat(componente.ponderacion);
    }
  });

  return Number(definitiva.toFixed(2));
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

    const { id_matricula, id_componente, id_periodo } = req.body;

    const validacionPeriodo = await verificarPeriodoAbierto(id_periodo);

    if (!validacionPeriodo.valido) {
      return res.status(validacionPeriodo.status).json({
        mensaje: validacionPeriodo.mensaje,
        resultado: validacionPeriodo.periodo,
      });
    }

    const validacionDocente = await verificarDocenteAsignado({
      id_docente: docente.id_docente,
      id_matricula,
      id_componente,
    });

    if (!validacionDocente.valido) {
      return res.status(validacionDocente.status).json({
        mensaje: validacionDocente.mensaje,
        resultado: validacionDocente.resultado,
      });
    }

    const nuevaNota = await NotaComponente.create({
      ...req.body,
      id_docente_registro: docente.id_docente,
    });

    const idAsignatura = validacionDocente.resultado.componente.id_asignatura;

    const notaDefinitiva = await calcularNotaDefinitiva(
      id_matricula,
      idAsignatura,
      id_periodo,
    );

    return res.status(201).json({
      mensaje: 'Nota registrada correctamente',
      resultado: {
        nota: nuevaNota,
        notaDefinitiva,
      },
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

    const nota = await NotaComponente.findByPk(id);

    if (!nota) {
      return res.status(404).json({
        mensaje: 'Nota no encontrada',
        resultado: null,
      });
    }

    const idPeriodoFinal = req.body.id_periodo || nota.id_periodo;
    const idMatriculaFinal = req.body.id_matricula || nota.id_matricula;
    const idComponenteFinal = req.body.id_componente || nota.id_componente;

    const validacionPeriodo = await verificarPeriodoAbierto(idPeriodoFinal);

    if (!validacionPeriodo.valido) {
      return res.status(validacionPeriodo.status).json({
        mensaje: validacionPeriodo.mensaje,
        resultado: validacionPeriodo.periodo,
      });
    }

    const docente = await obtenerDocenteAutenticado(req);

    if (!docente) {
      return res.status(403).json({
        mensaje: 'No existe un docente activo asociado al usuario autenticado',
        resultado: null,
      });
    }

    const validacionDocente = await verificarDocenteAsignado({
      id_docente: docente.id_docente,
      id_matricula: idMatriculaFinal,
      id_componente: idComponenteFinal,
    });

    if (!validacionDocente.valido) {
      return res.status(validacionDocente.status).json({
        mensaje: validacionDocente.mensaje,
        resultado: validacionDocente.resultado,
      });
    }

    await nota.update({
      ...req.body,
      id_docente_registro: docente.id_docente,
    });

    const idAsignatura = validacionDocente.resultado.componente.id_asignatura;

    const notaDefinitiva = await calcularNotaDefinitiva(
      idMatriculaFinal,
      idAsignatura,
      idPeriodoFinal,
    );

    return res.status(200).json({
      mensaje: 'Nota actualizada correctamente',
      resultado: {
        nota,
        notaDefinitiva,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarNotasGrupoPeriodo = async (req, res) => {
  try {
    const { id_grupo, id_periodo } = req.params;

    const periodo = await Periodo.findByPk(id_periodo);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

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

    const matriculas = await Matricula.findAll({
      where: {
        id_grupo,
        id_anio_lectivo: periodo.id_anio_lectivo,
      },
    });

    const idsMatriculas = matriculas.map((matricula) => matricula.id_matricula);

    const whereNotas = {
      id_periodo,
      id_matricula: {
        [Op.in]: idsMatriculas,
      },
    };

    if (req.usuario.rol === 'DOCENTE') {
      const docente = await obtenerDocenteAutenticado(req);

      if (!docente) {
        return res.status(403).json({
          mensaje:
            'No existe un docente activo asociado al usuario autenticado',
          resultado: null,
        });
      }

      const asignaciones = await DocenteAsignaturaGrupo.findAll({
        where: {
          id_docente: docente.id_docente,
          id_grupo,
          id_anio_lectivo: periodo.id_anio_lectivo,
        },
      });

      const idsAsignaturas = asignaciones.map(
        (asignacion) => asignacion.id_asignatura,
      );

      const componentesPermitidos = await ComponenteCalificacion.findAll({
        where: {
          id_asignatura: {
            [Op.in]: idsAsignaturas,
          },
          id_anio_lectivo: periodo.id_anio_lectivo,
        },
      });

      const idsComponentesPermitidos = componentesPermitidos.map(
        (componente) => componente.id_componente,
      );

      whereNotas.id_componente = {
        [Op.in]: idsComponentesPermitidos,
      };
    }

    const notas = await NotaComponente.findAll({
      where: whereNotas,
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
          model: ComponenteCalificacion,
          as: 'componente',
          required: false,
          include: [
            {
              model: Asignatura,
              as: 'asignatura',
              required: false,
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
      order: [
        ['id_matricula', 'ASC'],
        ['id_componente', 'ASC'],
      ],
    });

    return res.status(200).json({
      mensaje: 'Notas del grupo en el periodo listadas',
      resultado: {
        grupo,
        periodo,
        notas,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarNotasEstudiantePeriodo = async (req, res) => {
  try {
    const { id_matricula, id_periodo } = req.params;

    const periodo = await Periodo.findByPk(id_periodo);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

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
      ],
    });

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const whereNotas = {
      id_matricula,
      id_periodo,
    };

    if (req.usuario.rol === 'DOCENTE') {
      const docente = await obtenerDocenteAutenticado(req);

      if (!docente) {
        return res.status(403).json({
          mensaje:
            'No existe un docente activo asociado al usuario autenticado',
          resultado: null,
        });
      }

      const asignaciones = await DocenteAsignaturaGrupo.findAll({
        where: {
          id_docente: docente.id_docente,
          id_grupo: matricula.id_grupo,
          id_anio_lectivo: matricula.id_anio_lectivo,
        },
      });

      const idsAsignaturas = asignaciones.map(
        (asignacion) => asignacion.id_asignatura,
      );

      const componentesPermitidos = await ComponenteCalificacion.findAll({
        where: {
          id_asignatura: {
            [Op.in]: idsAsignaturas,
          },
          id_anio_lectivo: matricula.id_anio_lectivo,
        },
      });

      const idsComponentesPermitidos = componentesPermitidos.map(
        (componente) => componente.id_componente,
      );

      whereNotas.id_componente = {
        [Op.in]: idsComponentesPermitidos,
      };
    }

    const notas = await NotaComponente.findAll({
      where: whereNotas,
      include: [
        {
          model: ComponenteCalificacion,
          as: 'componente',
          required: false,
          include: [
            {
              model: Asignatura,
              as: 'asignatura',
              required: false,
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
      order: [['id_componente', 'ASC']],
    });

    return res.status(200).json({
      mensaje: 'Notas del estudiante en el periodo listadas',
      resultado: {
        matricula,
        periodo,
        notas,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const obtenerNotaDefinitiva = async (req, res) => {
  try {
    const { id_matricula, id_asignatura, id_periodo } = req.params;

    const matricula = await Matricula.findByPk(id_matricula);

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const periodo = await Periodo.findByPk(id_periodo);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
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

      const asignacion = await DocenteAsignaturaGrupo.findOne({
        where: {
          id_docente: docente.id_docente,
          id_asignatura,
          id_grupo: matricula.id_grupo,
          id_anio_lectivo: matricula.id_anio_lectivo,
        },
      });

      if (!asignacion) {
        return res.status(403).json({
          mensaje:
            'El docente no tiene permiso para consultar esta nota definitiva',
          resultado: null,
        });
      }
    }

    const notaDefinitiva = await calcularNotaDefinitiva(
      id_matricula,
      id_asignatura,
      id_periodo,
    );

    const componentes = await ComponenteCalificacion.findAll({
      where: {
        id_asignatura,
        id_anio_lectivo: matricula.id_anio_lectivo,
      },
    });

    const idsComponentes = componentes.map(
      (componente) => componente.id_componente,
    );

    const notasComponentes = await NotaComponente.findAll({
      where: {
        id_matricula,
        id_periodo,
        id_componente: {
          [Op.in]: idsComponentes,
        },
      },
      include: [
        {
          model: ComponenteCalificacion,
          as: 'componente',
          required: false,
        },
      ],
    });

    return res.status(200).json({
      mensaje: 'Nota definitiva calculada',
      resultado: {
        id_matricula: Number(id_matricula),
        id_asignatura: Number(id_asignatura),
        id_periodo: Number(id_periodo),
        notaDefinitiva,
        componentes,
        notasComponentes,
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
  listarNotasGrupoPeriodo,
  listarNotasEstudiantePeriodo,
  obtenerNotaDefinitiva,
  calcularNotaDefinitiva,
};
