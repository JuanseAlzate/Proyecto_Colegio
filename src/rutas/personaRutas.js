const express = require('express');

const enrutador = express.Router();

const personaControlador = require('../controladores/personaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  personaControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  personaControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  personaControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  personaControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  personaControlador.borrarRegistro,
);

module.exports = enrutador;
