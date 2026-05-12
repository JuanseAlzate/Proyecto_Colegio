const defineConfiguracionSistema = (sequelize, DataTypes) => {
  return sequelize.define(
    'ConfiguracionSistema',
    {
      clave: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
      valor: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'configuracion_sistema',
      timestamps: false,
    },
  );
};

module.exports = defineConfiguracionSistema;
