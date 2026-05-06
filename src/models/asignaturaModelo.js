const defineAsignatura = (sequelize, DataTypes) => {
  return sequelize.define(
    'Asignatura',
    {
      id_asignatura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'ASIGNATURA',
      timestamps: false,
    },
  );
};

module.exports = defineAsignatura;
