const { QueryTypes } = require('sequelize');

const {
  sequelize,
  Persona,
  Docente,
  Acudiente,
  Matricula,
  Periodo,
  DocenteAsignaturaGrupo,
} = require('../baseDatos/index');

const obtenerDocenteAutenticado = async (req) => {
  const persona = await Persona.findOne({
    where: {
      id_usuario: req.usuario.id_usuario,
    },
  });

  if (!persona) {
    return null;
  }

  const docente = await Docente.findOne({
    where: {
      id_persona: persona.id_persona,
      activo: true,
    },
  });

  return docente;
};

const obtenerAcudienteAutenticado = async (req) => {
  const persona = await Persona.findOne({
    where: {
      id_usuario: req.usuario.id_usuario,
    },
  });

  if (!persona) {
    return null;
  }

  const acudiente = await Acudiente.findOne({
    where: {
      id_persona: persona.id_persona,
    },
  });

  return acudiente;
};

const verificarAccesoBoletin = async (req, matricula, periodo) => {
  if (req.usuario.rol === 'COORDINADOR') {
    return {
      permitido: true,
      mensaje: 'Acceso permitido',
    };
  }

  if (req.usuario.rol === 'DOCENTE') {
    const docente = await obtenerDocenteAutenticado(req);

    if (!docente) {
      return {
        permitido: false,
        status: 403,
        mensaje: 'No existe un docente activo asociado al usuario autenticado',
      };
    }

    const asignacion = await DocenteAsignaturaGrupo.findOne({
      where: {
        id_docente: docente.id_docente,
        id_grupo: matricula.id_grupo,
        id_anio_lectivo: periodo.id_anio_lectivo,
      },
    });

    if (!asignacion) {
      return {
        permitido: false,
        status: 403,
        mensaje: 'El docente no tiene permiso para consultar este boletin',
      };
    }

    return {
      permitido: true,
      mensaje: 'Acceso permitido',
    };
  }

  if (req.usuario.rol === 'ACUDIENTE') {
    const acudiente = await obtenerAcudienteAutenticado(req);

    if (!acudiente) {
      return {
        permitido: false,
        status: 403,
        mensaje: 'No existe un acudiente asociado al usuario autenticado',
      };
    }

    const [validacion] = await sequelize.query(
      `
      SELECT 
        E.id_estudiante,
        E.id_acudiente
      FROM matricula M
      INNER JOIN estudiante E ON E.id_estudiante = M.id_estudiante
      WHERE M.id_matricula = :id_matricula
        AND E.id_acudiente = :id_acudiente
      LIMIT 1
      `,
      {
        replacements: {
          id_matricula: matricula.id_matricula,
          id_acudiente: acudiente.id_acudiente,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!validacion) {
      return {
        permitido: false,
        status: 403,
        mensaje: 'El acudiente no tiene permiso para consultar este boletin',
      };
    }

    return {
      permitido: true,
      mensaje: 'Acceso permitido',
    };
  }

  return {
    permitido: false,
    status: 403,
    mensaje: 'Rol no autorizado',
  };
};

const obtenerBoletin = async (req, res) => {
  try {
    const { id_matricula, id_periodo } = req.params;

    const matricula = await Matricula.findByPk(id_matricula);

    if (!matricula) {
      return res.status(404).json({
        mensaje: 'Matricula no encontrada',
        resultado: null,
      });
    }

    const periodo = await Periodo.findByPk(id_periodo);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    if (Number(matricula.id_anio_lectivo) !== Number(periodo.id_anio_lectivo)) {
      return res.status(400).json({
        mensaje: 'La matricula no pertenece al mismo año lectivo del periodo',
        resultado: {
          id_anio_matricula: matricula.id_anio_lectivo,
          id_anio_periodo: periodo.id_anio_lectivo,
        },
      });
    }

    const acceso = await verificarAccesoBoletin(req, matricula, periodo);

    if (!acceso.permitido) {
      return res.status(acceso.status).json({
        mensaje: acceso.mensaje,
        resultado: null,
      });
    }

    const datosEstudiante = await sequelize.query(
      `
      SELECT
        M.id_matricula,
        M.fecha_matricula,
        M.estado AS estado_matricula,

        E.id_estudiante,
        E.estado AS estado_estudiante,
        E.fecha_ingreso,

        PE.id_persona AS id_persona_estudiante,
        PE.nombre AS nombre_estudiante,
        PE.apellidos AS apellidos_estudiante,
        PE.fecha_nacimiento,
        PE.genero,
        PE.email AS email_estudiante,

        A.id_acudiente,
        PA.nombre AS nombre_acudiente,
        PA.apellidos AS apellidos_acudiente,
        A.parentesco,

        G.id_grupo,
        G.nombre AS nombre_grupo,

        GR.id_grado,
        GR.nombre AS nombre_grado,
        GR.nivel,

        AL.id_anio,
        AL.nombre AS anio_lectivo,
        AL.fecha_inicio AS fecha_inicio_anio,
        AL.fecha_fin AS fecha_fin_anio,

        P.id_periodo,
        P.numero AS numero_periodo,
        P.fecha_inicio AS fecha_inicio_periodo,
        P.fecha_fin AS fecha_fin_periodo,
        P.cerrado AS periodo_cerrado
      FROM matricula M
      INNER JOIN estudiante E ON E.id_estudiante = M.id_estudiante
      INNER JOIN persona PE ON PE.id_persona = E.id_persona
      LEFT JOIN acudiente A ON A.id_acudiente = E.id_acudiente
      LEFT JOIN persona PA ON PA.id_persona = A.id_persona
      INNER JOIN grupo G ON G.id_grupo = M.id_grupo
      INNER JOIN grado GR ON GR.id_grado = G.id_grado
      INNER JOIN anio_lectivo AL ON AL.id_anio = M.id_anio_lectivo
      INNER JOIN periodo P ON P.id_anio_lectivo = AL.id_anio
      WHERE M.id_matricula = :id_matricula
        AND P.id_periodo = :id_periodo
      LIMIT 1
      `,
      {
        replacements: {
          id_matricula,
          id_periodo,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!datosEstudiante || datosEstudiante.length === 0) {
      return res.status(404).json({
        mensaje: 'No se encontraron datos para generar el boletin',
        resultado: null,
      });
    }

    const asignaturas = await sequelize.query(
      `
      SELECT
        ASIG.id_asignatura,
        ASIG.nombre AS nombre_asignatura,
        ASIG.descripcion,

        CC.id_componente,
        CC.nombre AS nombre_componente,
        CC.ponderacion,

        NC.id_nota_componente,
        NC.valor,
        NC.fecha_registro,
        NC.id_docente_registro,

        PD.nombre AS nombre_docente,
        PD.apellidos AS apellidos_docente
      FROM matricula M
      INNER JOIN grupo G ON G.id_grupo = M.id_grupo
      INNER JOIN grado_asignatura GA ON GA.id_grado = G.id_grado
      INNER JOIN asignatura ASIG ON ASIG.id_asignatura = GA.id_asignatura
      LEFT JOIN componente_calificacion CC 
        ON CC.id_asignatura = ASIG.id_asignatura
        AND CC.id_anio_lectivo = M.id_anio_lectivo
      LEFT JOIN nota_componente NC
        ON NC.id_componente = CC.id_componente
        AND NC.id_matricula = M.id_matricula
        AND NC.id_periodo = :id_periodo
      LEFT JOIN docente D ON D.id_docente = NC.id_docente_registro
      LEFT JOIN persona PD ON PD.id_persona = D.id_persona
      WHERE M.id_matricula = :id_matricula
      ORDER BY ASIG.nombre ASC, CC.nombre ASC
      `,
      {
        replacements: {
          id_matricula,
          id_periodo,
        },
        type: QueryTypes.SELECT,
      },
    );

    const asistenciaPeriodo = await sequelize.query(
      `
      SELECT
        COUNT(AD.id_asistencia) AS total_registros,
        SUM(CASE WHEN AD.estado = 'PRESENTE' THEN 1 ELSE 0 END) AS total_presentes,
        SUM(CASE WHEN AD.estado = 'AUSENTE_JUSTIFICADO' THEN 1 ELSE 0 END) AS total_ausentes_justificados,
        SUM(CASE WHEN AD.estado = 'AUSENTE_INJUSTIFICADO' THEN 1 ELSE 0 END) AS total_ausentes_injustificados
      FROM asistencia_diaria AD
      INNER JOIN periodo P ON P.id_periodo = :id_periodo
      WHERE AD.id_matricula = :id_matricula
        AND AD.fecha BETWEEN P.fecha_inicio AND P.fecha_fin
      `,
      {
        replacements: {
          id_matricula,
          id_periodo,
        },
        type: QueryTypes.SELECT,
      },
    );

    const mapaAsignaturas = {};

    asignaturas.forEach((fila) => {
      if (!mapaAsignaturas[fila.id_asignatura]) {
        mapaAsignaturas[fila.id_asignatura] = {
          id_asignatura: fila.id_asignatura,
          nombre: fila.nombre_asignatura,
          descripcion: fila.descripcion,
          componentes: [],
          notaDefinitiva: 0,
        };
      }

      if (fila.id_componente) {
        const valorNota = fila.valor !== null ? parseFloat(fila.valor) : null;
        const ponderacion = parseFloat(fila.ponderacion);

        mapaAsignaturas[fila.id_asignatura].componentes.push({
          id_componente: fila.id_componente,
          nombre: fila.nombre_componente,
          ponderacion,
          nota: valorNota,
          fecha_registro: fila.fecha_registro,
          docente_registro: fila.id_docente_registro
            ? {
                id_docente: fila.id_docente_registro,
                nombre: fila.nombre_docente,
                apellidos: fila.apellidos_docente,
              }
            : null,
        });

        if (valorNota !== null) {
          mapaAsignaturas[fila.id_asignatura].notaDefinitiva +=
            valorNota * ponderacion;
        }
      }
    });

    const asignaturasBoletin = Object.values(mapaAsignaturas).map(
      (asignatura) => ({
        ...asignatura,
        notaDefinitiva: Number(asignatura.notaDefinitiva.toFixed(2)),
      }),
    );

    const sumaDefinitivas = asignaturasBoletin.reduce((total, asignatura) => {
      return total + asignatura.notaDefinitiva;
    }, 0);

    const promedioGeneral =
      asignaturasBoletin.length > 0
        ? Number((sumaDefinitivas / asignaturasBoletin.length).toFixed(2))
        : 0;

    const resumenAsistencia = asistenciaPeriodo[0] || {
      total_registros: 0,
      total_presentes: 0,
      total_ausentes_justificados: 0,
      total_ausentes_injustificados: 0,
    };

    const totalRegistros = Number(resumenAsistencia.total_registros || 0);
    const totalPresentes = Number(resumenAsistencia.total_presentes || 0);

    const porcentajeAsistencia =
      totalRegistros > 0
        ? Number(((totalPresentes / totalRegistros) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      mensaje: 'Boletin academico generado',
      resultado: {
        estudiante: datosEstudiante[0],
        asignaturas: asignaturasBoletin,
        promedioGeneral,
        asistencia: {
          totalRegistros,
          totalPresentes,
          totalAusentesJustificados: Number(
            resumenAsistencia.total_ausentes_justificados || 0,
          ),
          totalAusentesInjustificados: Number(
            resumenAsistencia.total_ausentes_injustificados || 0,
          ),
          porcentajeAsistencia,
        },
        periodo: {
          id_periodo: datosEstudiante[0].id_periodo,
          numero: datosEstudiante[0].numero_periodo,
          fecha_inicio: datosEstudiante[0].fecha_inicio_periodo,
          fecha_fin: datosEstudiante[0].fecha_fin_periodo,
          cerrado: Boolean(datosEstudiante[0].periodo_cerrado),
          estado: datosEstudiante[0].periodo_cerrado ? 'CERRADO' : 'ABIERTO',
        },
      },
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: error.message,
      resultado: null,
    });
  }
};

const obtenerAvanceNotas = async (req, res) => {
  try {
    const { id_grupo, id_periodo } = req.params;

    const periodo = await Periodo.findByPk(id_periodo);

    if (!periodo) {
      return res.status(404).json({
        mensaje: 'Periodo no encontrado',
        resultado: null,
      });
    }

    if (req.usuario.rol === 'DOCENTE') {
      const docente = await obtenerDocenteAutenticado(req);

      if (!docente) {
        return res.status(403).json({
          mensaje:
            'No existe un docente activo asociado al usuario autenticado',
          resultado: null,
        });
      }

      const asignacion = await DocenteAsignaturaGrupo.findOne({
        where: {
          id_docente: docente.id_docente,
          id_grupo,
          id_anio_lectivo: periodo.id_anio_lectivo,
        },
      });

      if (!asignacion) {
        return res.status(403).json({
          mensaje:
            'El docente no tiene permiso para consultar avance de este grupo',
          resultado: null,
        });
      }
    }

    if (req.usuario.rol === 'ACUDIENTE') {
      return res.status(403).json({
        mensaje:
          'El acudiente no tiene permiso para consultar avance de notas del grupo',
        resultado: null,
      });
    }

    const avance = await sequelize.query(
      `
      SELECT
        ASIG.id_asignatura,
        ASIG.nombre AS nombre_asignatura,

        COUNT(DISTINCT M.id_matricula) AS total_estudiantes,
        COUNT(DISTINCT CC.id_componente) AS total_componentes,

        COUNT(DISTINCT M.id_matricula) * COUNT(DISTINCT CC.id_componente) AS total_esperado,

        COUNT(NC.id_nota_componente) AS total_registrado,

        CASE
          WHEN COUNT(DISTINCT M.id_matricula) * COUNT(DISTINCT CC.id_componente) = 0 THEN 0
          ELSE ROUND(
            (
              COUNT(NC.id_nota_componente) /
              (COUNT(DISTINCT M.id_matricula) * COUNT(DISTINCT CC.id_componente))
            ) * 100,
            2
          )
        END AS porcentaje_avance
      FROM grupo G
      INNER JOIN grado_asignatura GA ON GA.id_grado = G.id_grado
      INNER JOIN asignatura ASIG ON ASIG.id_asignatura = GA.id_asignatura
      LEFT JOIN componente_calificacion CC
        ON CC.id_asignatura = ASIG.id_asignatura
        AND CC.id_anio_lectivo = G.id_anio_lectivo
      LEFT JOIN matricula M
        ON M.id_grupo = G.id_grupo
        AND M.id_anio_lectivo = G.id_anio_lectivo
        AND M.estado = 'ACTIVA'
      LEFT JOIN nota_componente NC
        ON NC.id_matricula = M.id_matricula
        AND NC.id_componente = CC.id_componente
        AND NC.id_periodo = :id_periodo
      WHERE G.id_grupo = :id_grupo
      GROUP BY ASIG.id_asignatura, ASIG.nombre
      ORDER BY ASIG.nombre ASC
      `,
      {
        replacements: {
          id_grupo,
          id_periodo,
        },
        type: QueryTypes.SELECT,
      },
    );

    const resumen = await sequelize.query(
      `
      SELECT
        COUNT(DISTINCT M.id_matricula) AS total_estudiantes,
        COUNT(DISTINCT CC.id_componente) AS total_componentes,
        COUNT(NC.id_nota_componente) AS total_notas_registradas
      FROM grupo G
      INNER JOIN grado_asignatura GA ON GA.id_grado = G.id_grado
      INNER JOIN asignatura ASIG ON ASIG.id_asignatura = GA.id_asignatura
      LEFT JOIN componente_calificacion CC
        ON CC.id_asignatura = ASIG.id_asignatura
        AND CC.id_anio_lectivo = G.id_anio_lectivo
      LEFT JOIN matricula M
        ON M.id_grupo = G.id_grupo
        AND M.id_anio_lectivo = G.id_anio_lectivo
        AND M.estado = 'ACTIVA'
      LEFT JOIN nota_componente NC
        ON NC.id_matricula = M.id_matricula
        AND NC.id_componente = CC.id_componente
        AND NC.id_periodo = :id_periodo
      WHERE G.id_grupo = :id_grupo
      `,
      {
        replacements: {
          id_grupo,
          id_periodo,
        },
        type: QueryTypes.SELECT,
      },
    );

    const totalEsperadoGeneral = avance.reduce((total, item) => {
      return total + Number(item.total_esperado || 0);
    }, 0);

    const totalRegistradoGeneral = avance.reduce((total, item) => {
      return total + Number(item.total_registrado || 0);
    }, 0);

    const porcentajeGeneral =
      totalEsperadoGeneral > 0
        ? Number(
            ((totalRegistradoGeneral / totalEsperadoGeneral) * 100).toFixed(2),
          )
        : 0;

    return res.status(200).json({
      mensaje: 'Avance de notas del grupo calculado',
      resultado: {
        id_grupo: Number(id_grupo),
        id_periodo: Number(id_periodo),
        resumen: {
          ...(resumen[0] || {}),
          totalEsperadoGeneral,
          totalRegistradoGeneral,
          porcentajeGeneral,
        },
        avancePorAsignatura: avance,
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
  obtenerBoletin,
  obtenerAvanceNotas,
};
