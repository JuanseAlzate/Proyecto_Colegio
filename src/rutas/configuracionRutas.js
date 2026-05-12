const express = require('express');

const enrutador = express.Router();

const configuracionControlador = require('../controladores/configuracionControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.get(
  '/',
  verifyToken,
  checkRol(['COORDINADOR']),
  configuracionControlador.listarRegistros,
);

enrutador.get(
  '/:clave',
  verifyToken,
  checkRol(['COORDINADOR']),
  configuracionControlador.obtenerRegistro,
);

enrutador.put(
  '/:clave',
  verifyToken,
  checkRol(['COORDINADOR']),
  configuracionControlador.actualizarRegistro,
);

module.exports = enrutador;
