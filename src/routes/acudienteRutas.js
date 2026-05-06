const express = require('express');

const enrutador = express.Router();

const acudienteControlador = require('../controladores/acudienteControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  acudienteControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  acudienteControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  acudienteControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  acudienteControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  acudienteControlador.borrarRegistro,
);

module.exports = enrutador;
