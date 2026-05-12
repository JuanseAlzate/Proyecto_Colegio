const Joi = require('joi');
const { Grado } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  nombre: Joi.string().max(10).required(),
  nivel: Joi.number().integer().min(1).max(11).required(),
});

const validadorActualizar = Joi.object({
  nombre: Joi.string().max(10).optional(),
  nivel: Joi.number().integer().min(1).max(11).optional(),
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

    const nuevo = await Grado.create(req.body);

    return res.status(201).json({
      mensaje: 'Grado creado',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await Grado.findAll();

    return res.status(200).json({
      mensaje: 'Grados listados',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Grado.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Grado no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Grado encontrado',
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

    const registro = await Grado.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Grado no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Grado actualizado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Grado.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Grado no encontrado',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Grado eliminado',
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
