const defineGradoAsignatura = (sequelize, DataTypes) => {
  return sequelize.define(
    'GradoAsignatura',
    {
      id_grado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'grado',
          key: 'id_grado',
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
      horas_semanales: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
    },
    {
      tableName: 'grado_asignatura',
      timestamps: false,
    },
  );
};

module.exports = defineGradoAsignatura;
