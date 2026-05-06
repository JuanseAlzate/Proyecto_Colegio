const express = require('express');

const enrutador = express.Router();

const estudianteControlador = require('../controladores/estudianteControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.borrarRegistro,
);

enrutador.get(
  '/:id/acudientes',
  verifyToken,
  checkRol(['COORDINADOR']),
  estudianteControlador.listarAcudientesEstudiante,
);

module.exports = enrutador;
