const Joi = require('joi');
const { AnioLectivo } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  nombre: Joi.string().max(20).required(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().required(),
  estado: Joi.string().valid('ACTIVO', 'CERRADO').optional(),
});

const validadorActualizar = Joi.object({
  nombre: Joi.string().max(20).optional(),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().optional(),
  estado: Joi.string().valid('ACTIVO', 'CERRADO').optional(),
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

    const nuevo = await AnioLectivo.create(req.body);

    return res.status(201).json({
      mensaje: 'Año lectivo creado',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await AnioLectivo.findAll();

    return res.status(200).json({
      mensaje: 'Años lectivos listados',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await AnioLectivo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Año lectivo no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Año lectivo encontrado',
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

    const registro = await AnioLectivo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Año lectivo no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Año lectivo actualizado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await AnioLectivo.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Año lectivo no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Año lectivo eliminado',
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
