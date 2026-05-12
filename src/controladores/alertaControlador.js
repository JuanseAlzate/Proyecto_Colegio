const Joi = require('joi');
const { Op } = require('sequelize');

const {
  ConfiguracionSistema,
  AnioLectivo,
  Periodo,
  Matricula,
  Estudiante,
  Persona,
  Grupo,
  Grado,
  GradoAsignatura,
  Asignatura,
  ComponenteCalificacion,
  NotaComponente,
} = require('../baseDatos/index');

const validadorParametroAnio = Joi.object({
  id_anio: Joi.number().integer().required(),
});

const calcularDefinitivaInterna = async ({
  id_matricula,
  id_asignatura,
  id_periodo,
  id_anio_lectivo,
}) => {
  const componentes = await ComponenteCalificacion.findAll({
    where: {
      id_asignatura,
      id_anio_lectivo,
    },
  });

  if (componentes.length === 0) {
    return {
      notaDefinitiva: 0,
      totalComponentes: 0,
      componentesRegistrados: 0,
      componentes: [],
    };
  }

  const idsComponentes = componentes.map(
    (componente) => componente.id_componente,
  );

  const notas = await NotaComponente.findAll({
    where: {
      id_matricula,
      id_periodo,
      id_componente: {
        [Op.in]: idsComponentes,
      },
    },
  });

  let notaDefinitiva = 0;

  const componentesDetalle = componentes.map((componente) => {
    const nota = notas.find(
      (notaComponente) =>
        Number(notaComponente.id_componente) ===
        Number(componente.id_componente),
    );

    const valorNota = nota ? parseFloat(nota.valor) : null;
    const ponderacion = parseFloat(componente.ponderacion);

    if (valorNota !== null) {
      notaDefinitiva += valorNota * ponderacion;
    }

    return {
      id_componente: componente.id_componente,
      nombre: componente.nombre,
      ponderacion,
      nota: valorNota,
    };
  });

  return {
    notaDefinitiva: Number(notaDefinitiva.toFixed(2)),
    totalComponentes: componentes.length,
    componentesRegistrados: notas.length,
    componentes: componentesDetalle,
  };
};

const listarBajoRendimiento = async (req, res) => {
  try {
    const { error } = validadorParametroAnio.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const mensajesErrores = error.details.map((d) => d.message).join('|');

      return res.status(400).json({
        mensaje: 'Errores en la validacion',
        resultado: {
          erroresValidacion: mensajesErrores,
        },
      });
    }

    const { id_anio } = req.params;

    const anioLectivo = await AnioLectivo.findByPk(id_anio);

    if (!anioLectivo) {
      return res.status(404).json({
        mensaje: 'Año lectivo no encontrado',
        resultado: null,
      });
    }

    const configuracionNotaMinima = await ConfiguracionSistema.findByPk(
      'nota_minima_rendimiento',
    );

    const notaMinimaRendimiento = configuracionNotaMinima
      ? parseFloat(configuracionNotaMinima.valor)
      : 3.0;

    const periodos = await Periodo.findAll({
      where: {
        id_anio_lectivo: id_anio,
      },
      order: [['numero', 'ASC']],
    });

    const matriculas = await Matricula.findAll({
      where: {
        id_anio_lectivo: id_anio,
        estado: 'ACTIVA',
      },
      include: [
        {
          model: Estudiante,
          as: 'estudiante',
          required: true,
          include: [
            {
              model: Persona,
              as: 'persona',
              required: false,
            },
          ],
        },
        {
          model: Grupo,
          as: 'grupo',
          required: true,
          include: [
            {
              model: Grado,
              as: 'grado',
              required: false,
            },
          ],
        },
      ],
    });

    const alertas = [];

    for (const matricula of matriculas) {
      const idGrado = matricula.grupo.id_grado;

      const gradosAsignaturas = await GradoAsignatura.findAll({
        where: {
          id_grado: idGrado,
        },
        include: [
          {
            model: Asignatura,
            as: 'asignatura',
            required: false,
          },
        ],
      });

      for (const periodo of periodos) {
        for (const gradoAsignatura of gradosAsignaturas) {
          const resultadoDefinitiva = await calcularDefinitivaInterna({
            id_matricula: matricula.id_matricula,
            id_asignatura: gradoAsignatura.id_asignatura,
            id_periodo: periodo.id_periodo,
            id_anio_lectivo: id_anio,
          });

          if (
            resultadoDefinitiva.totalComponentes > 0 &&
            resultadoDefinitiva.notaDefinitiva < notaMinimaRendimiento
          ) {
            alertas.push({
              id_matricula: matricula.id_matricula,
              id_estudiante: matricula.id_estudiante,
              estudiante: matricula.estudiante,
              grupo: matricula.grupo,
              periodo: {
                id_periodo: periodo.id_periodo,
                numero: periodo.numero,
                cerrado: periodo.cerrado,
              },
              asignatura: {
                id_asignatura: gradoAsignatura.id_asignatura,
                nombre: gradoAsignatura.asignatura
                  ? gradoAsignatura.asignatura.nombre
                  : null,
              },
              notaDefinitiva: resultadoDefinitiva.notaDefinitiva,
              notaMinimaRendimiento,
              totalComponentes: resultadoDefinitiva.totalComponentes,
              componentesRegistrados:
                resultadoDefinitiva.componentesRegistrados,
              componentes: resultadoDefinitiva.componentes,
            });
          }
        }
      }
    }

    return res.status(200).json({
      mensaje: 'Alertas de bajo rendimiento listadas',
      resultado: {
        anioLectivo,
        notaMinimaRendimiento,
        totalAlertas: alertas.length,
        alertas,
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

module.exports = {
  listarBajoRendimiento,
};
