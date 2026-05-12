const express = require('express');

const enrutador = express.Router();

const gradoAsignaturaControlador = require('../controladores/gradoAsignaturaControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  gradoAsignaturaControlador.crearRegistro,
);
enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  gradoAsignaturaControlador.listarRegistros,
);
enrutador.get(
  '/obtener/:id_grado/:id_asignatura',
  verifyToken,
  checkRol(['COORDINADOR']),
  gradoAsignaturaControlador.obtenerRegistro,
);
enrutador.put(
  '/actualizar/:id_grado/:id_asignatura',
  verifyToken,
  checkRol(['COORDINADOR']),
  gradoAsignaturaControlador.actualizarRegistro,
);
enrutador.delete(
  '/borrar/:id_grado/:id_asignatura',
  verifyToken,
  checkRol(['COORDINADOR']),
  gradoAsignaturaControlador.borrarRegistro,
);

module.exports = enrutador;
