const express = require('express');

const enrutador = express.Router();

const docenteAsignaturaGrupoControlador = require('../controladores/docenteAsignaturaGrupoControlador');
const { verifyToken, checkRol } = require('../middleware/authMiddleware');

enrutador.post(
  '/crear',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.crearRegistro,
);

enrutador.get(
  '/listar',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.listarRegistros,
);

enrutador.get(
  '/docente/:id_docente',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.listarPorDocente,
);

enrutador.get(
  '/obtener/:id_docente/:id_asignatura/:id_grupo/:id_anio_lectivo',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.obtenerRegistro,
);

enrutador.put(
  '/actualizar/:id_docente/:id_asignatura/:id_grupo/:id_anio_lectivo',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.actualizarRegistro,
);

enrutador.delete(
  '/borrar/:id_docente/:id_asignatura/:id_grupo/:id_anio_lectivo',
  verifyToken,
  checkRol(['COORDINADOR']),
  docenteAsignaturaGrupoControlador.borrarRegistro,
);

module.exports = enrutador;
