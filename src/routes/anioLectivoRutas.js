const express = require('express');

const enrutador = express.Router();

const anioLectivoControlador = require('../controladores/anioLectivoControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  anioLectivoControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  anioLectivoControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  anioLectivoControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  anioLectivoControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  anioLectivoControlador.borrarRegistro,
);

module.exports = enrutador;
