const express = require('express');

const enrutador = express.Router();

const citacionControlador = require('../controladores/citacionControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/',
  verifyToken,
  checkRol(['DOCENTE']),
  citacionControlador.crearRegistro,
);

enrutador.put(
  '/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  citacionControlador.actualizarRegistro,
);

enrutador.get(
  '/estudiante/:id_estudiante',
  verifyToken,
  checkRol(['COORDINADOR', 'DOCENTE', 'ACUDIENTE']),
  citacionControlador.listarPorEstudiante,
);

enrutador.get(
  '/pendientes',
  verifyToken,
  checkRol(['COORDINADOR']),
  citacionControlador.listarPendientes,
);

enrutador.get(
  '/mes-actual',
  verifyToken,
  checkRol(['COORDINADOR']),
  citacionControlador.listarMesActual,
);

module.exports = enrutador;
