const express = require('express');

const enrutador = express.Router();

const matriculaControlador = require('../controladores/matriculaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.borrarRegistro,
);

enrutador.post(
  '/:id_matricula/acudiente',
  verifyToken,
  checkRol(['COORDINADOR']),
  matriculaControlador.vincularAcudiente,
);

module.exports = enrutador;
