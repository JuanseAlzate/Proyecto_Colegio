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
        unique: true,
        validate: {
          min: 6,
          max: 11,
        },
      },
    },
    {
      tableName: 'grado',
      timestamps: false,
    },
  );
};

module.exports = defineGrado;
