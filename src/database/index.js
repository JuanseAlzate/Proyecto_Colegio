require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

const defineConfiguracionSistema = require('../modelos/configuracionSistemaModelo');
const defineUsuario = require('../modelos/usuarioModelo');
const definePersona = require('../modelos/personaModelo');
const defineGrado = require('../modelos/gradoModelo');
const defineAsignatura = require('../modelos/asignaturaModelo');
const defineAnioLectivo = require('../modelos/anioLectivoModelo');
const defineEstudiante = require('../modelos/estudianteModelo');
const defineDocente = require('../modelos/docenteModelo');
const defineAcudiente = require('../modelos/acudienteModelo');
const defineGradoAsignatura = require('../modelos/gradoAsignaturaModelo');
const defineGrupo = require('../modelos/grupoModelo');
const definePeriodo = require('../modelos/periodoModelo');
const defineComponenteCalificacion = require('../modelos/componenteCalificacionModelo');
const defineMatricula = require('../modelos/matriculaModelo');
const defineDocenteAsignaturaGrupo = require('../modelos/docenteAsignaturaGrupoModelo');
const defineHorario = require('../modelos/horarioModelo');
const defineNotaComponente = require('../modelos/notaComponenteModelo');
const defineAsistenciaDiaria = require('../modelos/asistenciaDiariaModelo');
const defineCitacion = require('../modelos/citacionModelo');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  },
);

const ConfiguracionSistema = defineConfiguracionSistema(sequelize, DataTypes);
const Usuario = defineUsuario(sequelize, DataTypes);
const Persona = definePersona(sequelize, DataTypes);
const Grado = defineGrado(sequelize, DataTypes);
const Asignatura = defineAsignatura(sequelize, DataTypes);
const AnioLectivo = defineAnioLectivo(sequelize, DataTypes);
const Acudiente = defineAcudiente(sequelize, DataTypes);
const Estudiante = defineEstudiante(sequelize, DataTypes);
const Docente = defineDocente(sequelize, DataTypes);
const GradoAsignatura = defineGradoAsignatura(sequelize, DataTypes);
const Grupo = defineGrupo(sequelize, DataTypes);
const Periodo = definePeriodo(sequelize, DataTypes);
const ComponenteCalificacion = defineComponenteCalificacion(
  sequelize,
  DataTypes,
);
const Matricula = defineMatricula(sequelize, DataTypes);
const DocenteAsignaturaGrupo = defineDocenteAsignaturaGrupo(
  sequelize,
  DataTypes,
);
const Horario = defineHorario(sequelize, DataTypes);
const NotaComponente = defineNotaComponente(sequelize, DataTypes);
const AsistenciaDiaria = defineAsistenciaDiaria(sequelize, DataTypes);
const Citacion = defineCitacion(sequelize, DataTypes);

Usuario.hasOne(Persona, {
  foreignKey: 'id_usuario',
  as: 'persona',
});

Persona.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario',
});

Persona.hasOne(Estudiante, {
  foreignKey: 'id_persona',
  as: 'estudiante',
});

Estudiante.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona',
});

Persona.hasOne(Docente, {
  foreignKey: 'id_persona',
  as: 'docente',
});

Docente.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona',
});

Persona.hasOne(Acudiente, {
  foreignKey: 'id_persona',
  as: 'acudiente',
});

Acudiente.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona',
});

Acudiente.hasMany(Estudiante, {
  foreignKey: 'id_acudiente',
  as: 'estudiantes',
});

Estudiante.belongsTo(Acudiente, {
  foreignKey: 'id_acudiente',
  as: 'acudiente',
});

Grado.hasMany(Grupo, {
  foreignKey: 'id_grado',
  as: 'grupos',
});

Grupo.belongsTo(Grado, {
  foreignKey: 'id_grado',
  as: 'grado',
});

AnioLectivo.hasMany(Grupo, {
  foreignKey: 'id_anio_lectivo',
  as: 'grupos',
});

Grupo.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

AnioLectivo.hasMany(Periodo, {
  foreignKey: 'id_anio_lectivo',
  as: 'periodos',
});

Periodo.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

Grado.belongsToMany(Asignatura, {
  through: GradoAsignatura,
  foreignKey: 'id_grado',
  otherKey: 'id_asignatura',
  as: 'asignaturas',
});

Asignatura.belongsToMany(Grado, {
  through: GradoAsignatura,
  foreignKey: 'id_asignatura',
  otherKey: 'id_grado',
  as: 'grados',
});

Grado.hasMany(GradoAsignatura, {
  foreignKey: 'id_grado',
  as: 'gradosAsignaturas',
});

GradoAsignatura.belongsTo(Grado, {
  foreignKey: 'id_grado',
  as: 'grado',
});

Asignatura.hasMany(GradoAsignatura, {
  foreignKey: 'id_asignatura',
  as: 'gradosAsignaturas',
});

GradoAsignatura.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura',
});

Asignatura.hasMany(ComponenteCalificacion, {
  foreignKey: 'id_asignatura',
  as: 'componentes',
});

ComponenteCalificacion.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura',
});

AnioLectivo.hasMany(ComponenteCalificacion, {
  foreignKey: 'id_anio_lectivo',
  as: 'componentesCalificacion',
});

ComponenteCalificacion.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

Estudiante.hasMany(Matricula, {
  foreignKey: 'id_estudiante',
  as: 'matriculas',
});

Matricula.belongsTo(Estudiante, {
  foreignKey: 'id_estudiante',
  as: 'estudiante',
});

Grupo.hasMany(Matricula, {
  foreignKey: 'id_grupo',
  as: 'matriculas',
});

Matricula.belongsTo(Grupo, {
  foreignKey: 'id_grupo',
  as: 'grupo',
});

AnioLectivo.hasMany(Matricula, {
  foreignKey: 'id_anio_lectivo',
  as: 'matriculas',
});

Matricula.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

Docente.hasMany(DocenteAsignaturaGrupo, {
  foreignKey: 'id_docente',
  as: 'asignaciones',
});

DocenteAsignaturaGrupo.belongsTo(Docente, {
  foreignKey: 'id_docente',
  as: 'docente',
});

Asignatura.hasMany(DocenteAsignaturaGrupo, {
  foreignKey: 'id_asignatura',
  as: 'asignacionesDocente',
});

DocenteAsignaturaGrupo.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura',
});

Grupo.hasMany(DocenteAsignaturaGrupo, {
  foreignKey: 'id_grupo',
  as: 'asignacionesDocente',
});

DocenteAsignaturaGrupo.belongsTo(Grupo, {
  foreignKey: 'id_grupo',
  as: 'grupo',
});

AnioLectivo.hasMany(DocenteAsignaturaGrupo, {
  foreignKey: 'id_anio_lectivo',
  as: 'asignacionesDocente',
});

DocenteAsignaturaGrupo.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

Docente.belongsToMany(Asignatura, {
  through: DocenteAsignaturaGrupo,
  foreignKey: 'id_docente',
  otherKey: 'id_asignatura',
  as: 'asignaturas',
});

Asignatura.belongsToMany(Docente, {
  through: DocenteAsignaturaGrupo,
  foreignKey: 'id_asignatura',
  otherKey: 'id_docente',
  as: 'docentes',
});

Docente.belongsToMany(Grupo, {
  through: DocenteAsignaturaGrupo,
  foreignKey: 'id_docente',
  otherKey: 'id_grupo',
  as: 'grupos',
});

Grupo.belongsToMany(Docente, {
  through: DocenteAsignaturaGrupo,
  foreignKey: 'id_grupo',
  otherKey: 'id_docente',
  as: 'docentes',
});

Docente.hasMany(Horario, {
  foreignKey: 'id_docente',
  as: 'horarios',
});

Horario.belongsTo(Docente, {
  foreignKey: 'id_docente',
  as: 'docente',
});

Asignatura.hasMany(Horario, {
  foreignKey: 'id_asignatura',
  as: 'horarios',
});

Horario.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura',
});

Grupo.hasMany(Horario, {
  foreignKey: 'id_grupo',
  as: 'horarios',
});

Horario.belongsTo(Grupo, {
  foreignKey: 'id_grupo',
  as: 'grupo',
});

AnioLectivo.hasMany(Horario, {
  foreignKey: 'id_anio_lectivo',
  as: 'horarios',
});

Horario.belongsTo(AnioLectivo, {
  foreignKey: 'id_anio_lectivo',
  as: 'anioLectivo',
});

Matricula.hasMany(NotaComponente, {
  foreignKey: 'id_matricula',
  as: 'notas',
});

NotaComponente.belongsTo(Matricula, {
  foreignKey: 'id_matricula',
  as: 'matricula',
});

ComponenteCalificacion.hasMany(NotaComponente, {
  foreignKey: 'id_componente',
  as: 'notas',
});

NotaComponente.belongsTo(ComponenteCalificacion, {
  foreignKey: 'id_componente',
  as: 'componente',
});

Periodo.hasMany(NotaComponente, {
  foreignKey: 'id_periodo',
  as: 'notas',
});

NotaComponente.belongsTo(Periodo, {
  foreignKey: 'id_periodo',
  as: 'periodo',
});

Docente.hasMany(NotaComponente, {
  foreignKey: 'id_docente_registro',
  as: 'notasRegistradas',
});

NotaComponente.belongsTo(Docente, {
  foreignKey: 'id_docente_registro',
  as: 'docenteRegistro',
});

Matricula.hasMany(AsistenciaDiaria, {
  foreignKey: 'id_matricula',
  as: 'asistencias',
});

AsistenciaDiaria.belongsTo(Matricula, {
  foreignKey: 'id_matricula',
  as: 'matricula',
});

Docente.hasMany(AsistenciaDiaria, {
  foreignKey: 'id_docente_registro',
  as: 'asistenciasRegistradas',
});

AsistenciaDiaria.belongsTo(Docente, {
  foreignKey: 'id_docente_registro',
  as: 'docenteRegistro',
});

Estudiante.hasMany(Citacion, {
  foreignKey: 'id_estudiante',
  as: 'citaciones',
});

Citacion.belongsTo(Estudiante, {
  foreignKey: 'id_estudiante',
  as: 'estudiante',
});

Acudiente.hasMany(Citacion, {
  foreignKey: 'id_acudiente',
  as: 'citaciones',
});

Citacion.belongsTo(Acudiente, {
  foreignKey: 'id_acudiente',
  as: 'acudiente',
});

Docente.hasMany(Citacion, {
  foreignKey: 'id_docente_genera',
  as: 'citacionesGeneradas',
});

Citacion.belongsTo(Docente, {
  foreignKey: 'id_docente_genera',
  as: 'docenteGenera',
});

sequelize
  .authenticate()
  .then(() => console.log('Conectado a la base de datos.'))
  .catch((err) => console.error('No se pudo conectar:', err));

sequelize
  .sync({ alter: true, force: false })
  .then(() => console.log('Sincronización completada.'))
  .catch((err) => console.error('Error en la sincronización:', err));

module.exports = {
  sequelize,
  ConfiguracionSistema,
  Usuario,
  Persona,
  Grado,
  Asignatura,
  AnioLectivo,
  Estudiante,
  Docente,
  Acudiente,
  GradoAsignatura,
  Grupo,
  Periodo,
  ComponenteCalificacion,
  Matricula,
  DocenteAsignaturaGrupo,
  Horario,
  NotaComponente,
  AsistenciaDiaria,
  Citacion,
};
