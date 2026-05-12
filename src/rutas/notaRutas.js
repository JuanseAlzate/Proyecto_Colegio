const express = require('express');

const enrutador = express.Router();

const notaControlador = require('../controladores/notaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/',
  verifyToken,
  checkRol(['DOCENTE']),
  notaControlador.crearRegistro,
);

enrutador.put(
  '/:id',
  verifyToken,
  checkRol(['DOCENTE']),
  notaControlador.actualizarRegistro,
);

enrutador.get(
  '/grupo/:id_grupo/periodo/:id_periodo',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  notaControlador.listarNotasGrupoPeriodo,
);

enrutador.get(
  '/estudiante/:id_matricula/periodo/:id_periodo',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  notaControlador.listarNotasEstudiantePeriodo,
);

enrutador.get(
  '/definitiva/:id_matricula/:id_asignatura/:id_periodo',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  notaControlador.obtenerNotaDefinitiva,
);

module.exports = enrutador;
