const Joi = require('joi');
const { Asignatura } = require('../baseDatos/index');

const validadorCrear = Joi.object({
  nombre: Joi.string().max(100).required(),
  descripcion: Joi.string().allow(null, '').optional(),
  activa: Joi.boolean().optional(),
});

const validadorActualizar = Joi.object({
  nombre: Joi.string().max(100).optional(),
  descripcion: Joi.string().allow(null, '').optional(),
  activa: Joi.boolean().optional(),
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

    const nuevo = await Asignatura.create(req.body);

    return res.status(201).json({
      mensaje: 'Asignatura creada',
      resultado: nuevo,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const registros = await Asignatura.findAll();

    return res.status(200).json({
      mensaje: 'Asignaturas listadas',
      resultado: registros,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Asignatura.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Asignatura no encontrada',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Asignatura encontrada',
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

    const registro = await Asignatura.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Asignatura no encontrada',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Asignatura actualizada',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarRegistro = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Asignatura.findByPk(id);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Asignatura no encontrada',
        resultado: null,
      });
    }

    await registro.destroy();

    return res.status(200).json({
      mensaje: 'Asignatura eliminada',
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
