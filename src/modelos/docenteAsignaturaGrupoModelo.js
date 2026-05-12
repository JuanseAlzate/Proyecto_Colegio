const defineDocenteAsignaturaGrupo = (sequelize, DataTypes) => {
  return sequelize.define(
    'DocenteAsignaturaGrupo',
    {
      id_docente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'docente',
          key: 'id_docente',
        },
      },
      id_asignatura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'asignatura',
          key: 'id_asignatura',
        },
      },
      id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'grupo',
          key: 'id_grupo',
        },
      },
      id_anio_lectivo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'anio_lectivo',
          key: 'id_anio',
        },
      },
    },
    {
      tableName: 'docente_asignatura_grupo',
      timestamps: false,
    },
  );
};

module.exports = defineDocenteAsignaturaGrupo;
