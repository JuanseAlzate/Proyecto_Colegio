const defineGrado = (sequelize, DataTypes) => {
  return sequelize.define(
    'Grado',
    {
      id_grado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      nivel: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 11,
        },
      },
    },
    {
      tableName: 'GRADO',
      timestamps: false,
    },
  );
};

module.exports = defineGrado;
