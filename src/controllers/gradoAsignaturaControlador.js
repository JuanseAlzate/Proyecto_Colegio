const Joi = require('joi');
const { GradoAsignatura } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  id_grado: Joi.number().integer().required(),
  id_asignatura: Joi.number().integer().required(),
  horas_semanales: Joi.number().integer().min(1).required(),
});

const validadorActualizar = Joi.object({
  horas_semanales: Joi.number().integer().min(1).required(),
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

    const nuevo = await GradoAsignatura.create(req.body);

    return res.status(201).json({
      mensaje: 'Asignatura asociada al grado',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await GradoAsignatura.findAll();

    return res.status(200).json({
      mensaje: 'Asignaturas por grado listadas',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id_grado, id_asignatura } = req.params;

    const registro = await GradoAsignatura.findOne({
      where: {
        id_grado,
        id_asignatura,
      },
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Relacion grado-asignatura no encontrada',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Relacion grado-asignatura encontrada',
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

    const { id_grado, id_asignatura } = req.params;

    const registro = await GradoAsignatura.findOne({
      where: {
        id_grado,
        id_asignatura,
      },
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Relacion grado-asignatura no encontrada',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Relacion grado-asignatura actualizada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id_grado, id_asignatura } = req.params;

    const registro = await GradoAsignatura.findOne({
      where: {
        id_grado,
        id_asignatura,
      },
    });

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Relacion grado-asignatura no encontrada',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Relacion grado-asignatura eliminada',
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
