const Joi = require('joi');
const { Periodo } = require('../baseDatos/index');

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

module.exports = {
  crearRegistro,
  listarRegistros,
  obtenerRegistro,
  actualizarRegistro,
  borrarRegistro,
};
