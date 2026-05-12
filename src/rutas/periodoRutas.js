const express = require('express');

const enrutador = express.Router();

const periodoControlador = require('../controladores/periodoControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.obtenerRegistro,
);

enrutador.put(
  '/:id/cerrar',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.cerrarPeriodo,
);
enrutador.put(
  '/:id/reabrir',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.reabrirPeriodo,
);

enrutador.put(
  '/actualizar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id',
  verifyToken,
  checkRol(['COORDINADOR']),
  periodoControlador.borrarRegistro,
);

module.exports = enrutador;
