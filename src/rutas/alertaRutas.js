const express = require('express');

const enrutador = express.Router();

const alertaControlador = require('../controladores/alertaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.get(
  '/bajo-rendimiento/:id_anio',
  verifyToken,
  checkRol(['COORDINADOR']),
  alertaControlador.listarBajoRendimiento,
);

module.exports = enrutador;
