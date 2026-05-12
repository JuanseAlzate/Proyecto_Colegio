const Joi = require('joi');
const { ConfiguracionSistema } = require('../baseDatos/index');

const validadorActualizar = Joi.object({
  valor: Joi.string().required(),
  descripcion: Joi.string().max(255).allow(null, '').optional(),
});

const listarRegistros = async (req, res) => {
  try {
    const registros = await ConfiguracionSistema.findAll();

    return res.status(200).json({
      mensaje: 'Configuracion del sistema listada',
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
    const { clave } = req.params;

    const registro = await ConfiguracionSistema.findByPk(clave);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Parametro de configuracion no encontrado',
        resultado: null,
      });
    }

    return res.status(200).json({
      mensaje: 'Parametro de configuracion encontrado',
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

    const { clave } = req.params;

    const registro = await ConfiguracionSistema.findByPk(clave);

    if (!registro) {
      return res.status(404).json({
        mensaje: 'Parametro de configuracion no encontrado',
        resultado: null,
      });
    }

    await registro.update(req.body);

    return res.status(200).json({
      mensaje: 'Parametro de configuracion actualizado',
      resultado: registro,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

module.exports = {
  listarRegistros,
  obtenerRegistro,
  actualizarRegistro,
};
