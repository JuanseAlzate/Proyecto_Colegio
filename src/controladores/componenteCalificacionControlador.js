const Joi = require('joi');
const { Op } = require('sequelize');
const { ComponenteCalificacion } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_asignatura: Joi.number().integer().required(),
  id_anio_lectivo: Joi.number().integer().required(),
  nombre: Joi.string().max(50).required(),
  ponderacion: Joi.number().greater(0).max(1).required(),
});

const validadorActualizar = Joi.object({
  id_asignatura: Joi.number().integer().optional(),
  id_anio_lectivo: Joi.number().integer().optional(),
  nombre: Joi.string().max(50).optional(),
  ponderacion: Joi.number().greater(0).max(1).optional(),
});

const validarSumaPonderaciones = async ({
  id_asignatura,
  id_anio_lectivo,
  ponderacion,
  id_componenteExcluir = null,
}) => {
  const where = {
    id_asignatura,
    id_anio_lectivo,
  };

  if (id_componenteExcluir) {
    where.id_componente = {
      [Op.ne]: id_componenteExcluir,
    };
  }

  const componentes = await ComponenteCalificacion.findAll({ where });

  const sumaExistente = componentes.reduce((total, componente) => {
    return total + parseFloat(componente.ponderacion);
  }, 0);

  const sumaTotal = sumaExistente + parseFloat(ponderacion);

  return {
    sumaTotal,
    valida: Math.abs(sumaTotal - 1) <= 0.0001,
  };
};

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

    const { id_asignatura, id_anio_lectivo, ponderacion } = req.body;

    const validacion = await validarSumaPonderaciones({
      id_asignatura,
      id_anio_lectivo,
      ponderacion,
    });

    if (!validacion.valida) {
      return res.status(400).json({
        mensaje: 'La suma de ponderaciones debe ser exactamente 1.0',
        resultado: {
          sumaCalculada: Number(validacion.sumaTotal.toFixed(4)),
        },
      });
    }

    const nuevo = await ComponenteCalificacion.create(req.body);

    return res.status(201).json({
      mensaje: 'Componente de calificacion creado',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await ComponenteCalificacion.findAll();

    return res.status(200).json({
      mensaje: 'Componentes de calificacion listados',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await ComponenteCalificacion.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Componente de calificacion no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Componente de calificacion encontrado',
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

    const registro = await ComponenteCalificacion.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Componente de calificacion no encontrado',
        resultado: null,
      });
    }

    const idAsignaturaFinal = req.body.id_asignatura || registro.id_asignatura;
    const idAnioLectivoFinal =
      req.body.id_anio_lectivo || registro.id_anio_lectivo;
    const ponderacionFinal =
      req.body.ponderacion !== undefined
        ? req.body.ponderacion
        : registro.ponderacion;

    const validacion = await validarSumaPonderaciones({
      id_asignatura: idAsignaturaFinal,
      id_anio_lectivo: idAnioLectivoFinal,
      ponderacion: ponderacionFinal,
      id_componenteExcluir: id,
    });

    if (!validacion.valida) {
      return res.status(400).json({
        mensaje: 'La suma de ponderaciones debe ser exactamente 1.0',
        resultado: {
          sumaCalculada: Number(validacion.sumaTotal.toFixed(4)),
        },
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Componente de calificacion actualizado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await ComponenteCalificacion.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Componente de calificacion no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Componente de calificacion eliminado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  crearRegistro,
  listarRegistros,
  obtenerRegistro,
  actualizarRegistro,
  borrarRegistro,
};
