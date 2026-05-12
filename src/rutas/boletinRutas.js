const express = require('express');

const enrutador = express.Router();

const boletinControlador = require('../controladores/boletinControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.get(
  '/avance/:id_grupo/:id_periodo',
  verifyToken,
  checkRol(['COORDINADOR', 'DOCENTE']),
  boletinControlador.obtenerAvanceNotas,
);

enrutador.get(
  '/:id_matricula/:id_periodo',
  verifyToken,
  checkRol(['COORDINADOR', 'DOCENTE', 'ACUDIENTE']),
  boletinControlador.obtenerBoletin,
);

module.exports = enrutador;
