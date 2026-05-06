const express = require('express');

const enrutador = express.Router();

const horarioControlador = require('../controladores/horarioControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.crearRegistro,
);

enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.listarRegistros,
);

enrutador.get(
  '/grupo/:id_grupo',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.listarPorGrupo,
);

enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.obtenerRegistro,
);

enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.actualizarRegistro,
);

enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  horarioControlador.borrarRegistro,
);

module.exports = enrutador;
