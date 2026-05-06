const defineGradoAsignatura = (sequelize, DataTypes) => {
  return sequelize.define(
    'GradoAsignatura',
    {
      id_grado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'GRADO',
          key: 'id_grado',
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
      horas_semanales: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
    },
    {
      tableName: 'GRADO_ASIGNATURA',
      timestamps: false,
    },
  );
};

module.exports = defineGradoAsignatura;
