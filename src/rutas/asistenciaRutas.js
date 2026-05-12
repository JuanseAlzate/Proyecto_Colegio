const express = require('express');

const enrutador = express.Router();

const asistenciaControlador = require('../controladores/asistenciaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/',
  verifyToken,
  checkRol(['DOCENTE']),
  asistenciaControlador.crearRegistro,
);

enrutador.put(
  '/:id',
  verifyToken,
  checkRol(['DOCENTE']),
  asistenciaControlador.actualizarRegistro,
);

enrutador.get(
  '/grupo/:id_grupo/fecha/:fecha',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  asistenciaControlador.listarPorGrupoFecha,
);

enrutador.get(
  '/estudiante/:id_matricula',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  asistenciaControlador.listarPorEstudiante,
);

enrutador.get(
  '/alertas/:id_anio',
  verifyToken,
  checkRol(['DOCENTE', 'COORDINADOR']),
  asistenciaControlador.listarAlertasInasistencia,
);

module.exports = enrutador;
