const defineAnioLectivo = (sequelize, DataTypes) => {
  return sequelize.define(
    'AnioLectivo',
    {
      id_anio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('ACTIVO', 'CERRADO'),
        defaultValue: 'ACTIVO',
      },
    },
    {
      tableName: 'ANIO_LECTIVO',
      timestamps: false,
    },
  );
};

module.exports = defineAnioLectivo;
