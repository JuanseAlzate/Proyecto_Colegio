require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Inicializar base de datos
require('./src/baseDatos/index');

// Importar rutas
const authRutas = require('./src/rutas/authRutas');

const anioLectivoRutas = require('./src/rutas/anioLectivoRutas');
const periodoRutas = require('./src/rutas/periodoRutas');
const gradoRutas = require('./src/rutas/gradoRutas');
const asignaturaRutas = require('./src/rutas/asignaturaRutas');
const gradoAsignaturaRutas = require('./src/rutas/gradoAsignaturaRutas');
const componenteCalificacionRutas = require('./src/rutas/componenteCalificacionRutas');

const personaRutas = require('./src/rutas/personaRutas');
const estudianteRutas = require('./src/rutas/estudianteRutas');
const acudienteRutas = require('./src/rutas/acudienteRutas');
const matriculaRutas = require('./src/rutas/matriculaRutas');

const docenteRutas = require('./src/rutas/docenteRutas');
const docenteAsignaturaGrupoRutas = require('./src/rutas/docenteAsignaturaGrupoRutas');

const horarioRutas = require('./src/rutas/horarioRutas');

const notaRutas = require('./src/rutas/notaRutas');
const asistenciaRutas = require('./src/rutas/asistenciaRutas');
const boletinRutas = require('./src/rutas/boletinRutas');
const citacionRutas = require('./src/rutas/citacionRutas');

const configuracionRutas = require('./src/rutas/configuracionRutas');
const alertaRutas = require('./src/rutas/alertaRutas');

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base
app.get('/', (req, res) => {
  return res.status(200).json({
    mensaje: 'API ColegioDB funcionando correctamente',
    resultado: {
      sistema: 'ColegioDB',
      version: '1.0.0',
    },
  });
});

// RF-01 Autenticación
app.use('/api/auth', authRutas);

// RF-02 Configuración del año lectivo
app.use('/api/anios', anioLectivoRutas);
app.use('/api/periodos', periodoRutas);
app.use('/api/grados', gradoRutas);
app.use('/api/asignaturas', asignaturaRutas);
app.use('/api/grados-asignaturas', gradoAsignaturaRutas);
app.use('/api/componentes', componenteCalificacionRutas);

// RF-03 Matrícula de estudiantes
app.use('/api/personas', personaRutas);
app.use('/api/estudiantes', estudianteRutas);
app.use('/api/acudientes', acudienteRutas);
app.use('/api/matriculas', matriculaRutas);

// RF-04 Asignación de docentes
app.use('/api/docentes', docenteRutas);
app.use('/api/asignaciones-docente', docenteAsignaturaGrupoRutas);

// RF-05 Horario de clases
app.use('/api/horarios', horarioRutas);

// RF-06 y RF-07 Notas y nota definitiva
app.use('/api/notas', notaRutas);

// RF-08 Asistencia
app.use('/api/asistencia', asistenciaRutas);

// RF-09 Boletín académico
app.use('/api/boletin', boletinRutas);

// RF-10 Citaciones
app.use('/api/citaciones', citacionRutas);

// RF-Extra Configuración del sistema
app.use('/api/configuracion', configuracionRutas);

// RF-Extra Alertas
app.use('/api/alertas', alertaRutas);

// Middleware para rutas no encontradas
app.use((req, res) => {
  return res.status(404).json({
    mensaje: 'Ruta no encontrada',
    resultado: {
      metodo: req.method,
      ruta: req.originalUrl,
    },
  });
});

// Middleware global de errores
app.use((error, req, res, next) => {
  return res.status(500).json({
    mensaje: error.message || 'Error interno del servidor',
    resultado: null,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor colegioDB ejecutandose en el puerto ${PORT}`);
});
