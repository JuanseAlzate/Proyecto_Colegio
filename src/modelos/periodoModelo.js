const definePeriodo = (sequelize, DataTypes) => {
  return sequelize.define(
    'Periodo',
    {
      id_periodo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_anio_lectivo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'anio_lectivo',
          key: 'id_anio',
        },
      },
      numero: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 4,
        },
      },
      fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      cerrado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'periodo',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_periodo_anio',
          fields: ['id_anio_lectivo', 'numero'],
        },
      ],
    },
  );
};

module.exports = definePeriodo;
