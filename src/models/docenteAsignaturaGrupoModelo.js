const defineDocenteAsignaturaGrupo = (sequelize, DataTypes) => {
  return sequelize.define(
    'DocenteAsignaturaGrupo',
    {
      id_docente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'DOCENTE',
          key: 'id_docente',
        },
      },
      id_asignatura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'ASIGNATURA',
          key: 'id_asignatura',
        },
      },
      id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'GRUPO',
          key: 'id_grupo',
        },
      },
      id_anio_lectivo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'ANIO_LECTIVO',
          key: 'id_anio',
        },
      },
    },
    {
      tableName: 'DOCENTE_ASIGNATURA_GRUPO',
      timestamps: false,
    },
  );
};

module.exports = defineDocenteAsignaturaGrupo;
