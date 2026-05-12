const Joi = require('joi');
const { Op } = require('sequelize');

const {
  Horario,
  Docente,
  Persona,
  Asignatura,
  Grupo,
  Grado,
  AnioLectivo,
  DocenteAsignaturaGrupo,
} = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_docente: Joi.number().integer().required(),
  id_asignatura: Joi.number().integer().required(),
  id_grupo: Joi.number().integer().required(),
  id_anio_lectivo: Joi.number().integer().required(),
  dia_semana: Joi.number().integer().min(1).max(5).required(),
  hora_inicio: Joi.string().required(),
  hora_fin: Joi.string().required(),
  salon: Joi.string().max(50).allow(null, '').optional(),
});

const validadorActualizar = Joi.object({
  id_docente: Joi.number().integer().optional(),
  id_asignatura: Joi.number().integer().optional(),
  id_grupo: Joi.number().integer().optional(),
  id_anio_lectivo: Joi.number().integer().optional(),
  dia_semana: Joi.number().integer().min(1).max(5).optional(),
  hora_inicio: Joi.string().optional(),
  hora_fin: Joi.string().optional(),
  salon: Joi.string().max(50).allow(null, '').optional(),
});

const validarRangoHoras = (hora_inicio, hora_fin) => {
  return hora_inicio < hora_fin;
};

const validarAsignacionDocenteHorario = async ({
  id_docente,
  id_asignatura,
  id_grupo,
  id_anio_lectivo,
}) => {
  const asignacion = await DocenteAsignaturaGrupo.findOne({
    where: {
      id_docente,
      id_asignatura,
      id_grupo,
      id_anio_lectivo,
    },
  });

  return asignacion;
};

const validarCruceHorario = async ({
  id_docente,
  dia_semana,
  hora_inicio,
  id_anio_lectivo,
  id_horarioExcluir = null,
}) => {
  const where = {
    id_docente,
    dia_semana,
    hora_inicio,
    id_anio_lectivo,
  };

  if (id_horarioExcluir) {
    where.id_horario = {
      [Op.ne]: id_horarioExcluir,
    };
  }

  const horarioExistente = await Horario.findOne({ where });

  return horarioExistente;
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

    if (!validarRangoHoras(req.body.hora_inicio, req.body.hora_fin)) {
      return res.status(400).json({
        mensaje: 'La hora de inicio debe ser menor que la hora de fin',
        resultado: null,
      });
    }

    const {
      id_docente,
      id_asignatura,
      id_grupo,
      id_anio_lectivo,
      dia_semana,
      hora_inicio,
    } = req.body;

    const asignacion = await validarAsignacionDocenteHorario({
      id_docente,
      id_asignatura,
      id_grupo,
      id_anio_lectivo,
    });

    if (!asignacion) {
      return res.status(400).json({
        mensaje:
          'No existe una asignacion docente para esa asignatura, grupo y año lectivo',
        resultado: {
          id_docente,
          id_asignatura,
          id_grupo,
          id_anio_lectivo,
        },
      });
    }

    const cruceHorario = await validarCruceHorario({
      id_docente,
      dia_semana,
      hora_inicio,
      id_anio_lectivo,
    });

    if (cruceHorario) {
      return res.status(400).json({
        mensaje: 'Cruce de horario detectado para el docente',
        resultado: {
          horarioExistente: cruceHorario,
        },
      });
    }

    const nuevo = await Horario.create(req.body);

    return res.status(201).json({
      mensaje: 'Horario creado',
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
    const registros = await Horario.findAll({
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
      order: [
        ['dia_semana', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });

    return res.status(200).json({
      mensaje: 'Horarios listados',
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

    const registro = await Horario.findByPk(id, {
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
        mensaje: 'Horario no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Horario encontrado',
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

    const registro = await Horario.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Horario no encontrado',
        resultado: null,
      });
    }

    const idDocenteFinal = req.body.id_docente || registro.id_docente;
    const idAsignaturaFinal = req.body.id_asignatura || registro.id_asignatura;
    const idGrupoFinal = req.body.id_grupo || registro.id_grupo;
    const idAnioLectivoFinal =
      req.body.id_anio_lectivo || registro.id_anio_lectivo;
    const diaSemanaFinal = req.body.dia_semana || registro.dia_semana;
    const horaInicioFinal = req.body.hora_inicio || registro.hora_inicio;
    const horaFinFinal = req.body.hora_fin || registro.hora_fin;

    if (!validarRangoHoras(horaInicioFinal, horaFinFinal)) {
      return res.status(400).json({
        mensaje: 'La hora de inicio debe ser menor que la hora de fin',
        resultado: null,
      });
    }

    const asignacion = await validarAsignacionDocenteHorario({
      id_docente: idDocenteFinal,
      id_asignatura: idAsignaturaFinal,
      id_grupo: idGrupoFinal,
      id_anio_lectivo: idAnioLectivoFinal,
    });

    if (!asignacion) {
      return res.status(400).json({
        mensaje:
          'No existe una asignacion docente para esa asignatura, grupo y año lectivo',
        resultado: {
          id_docente: idDocenteFinal,
          id_asignatura: idAsignaturaFinal,
          id_grupo: idGrupoFinal,
          id_anio_lectivo: idAnioLectivoFinal,
        },
      });
    }

    const cruceHorario = await validarCruceHorario({
      id_docente: idDocenteFinal,
      dia_semana: diaSemanaFinal,
      hora_inicio: horaInicioFinal,
      id_anio_lectivo: idAnioLectivoFinal,
      id_horarioExcluir: id,
    });

    if (cruceHorario) {
      return res.status(400).json({
        mensaje: 'Cruce de horario detectado para el docente',
        resultado: {
          horarioExistente: cruceHorario,
        },
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Horario actualizado',
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

    const registro = await Horario.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Horario no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Horario eliminado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const listarPorGrupo = async (req, res) => {
  try {
    const { id_grupo } = req.params;

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

    const horarios = await Horario.findAll({
      where: {
        id_grupo,
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
          model: AnioLectivo,
          as: 'anioLectivo',
          required: false,
        },
      ],
      order: [
        ['dia_semana', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });

    return res.status(200).json({
      mensaje: 'Horario del grupo listado',
      resultado: {
        grupo,
        horarios,
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
  listarPorGrupo,
};
