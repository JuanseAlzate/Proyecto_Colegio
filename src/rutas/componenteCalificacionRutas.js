const express = require('express');

const enrutador = express.Router();

const componenteCalificacionControlador = require('../controladores/componenteCalificacionControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  componenteCalificacionControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  componenteCalificacionControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  componenteCalificacionControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  componenteCalificacionControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  componenteCalificacionControlador.borrarRegistro,
);

module.exports = enrutador;
