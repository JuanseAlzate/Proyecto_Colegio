const defineComponenteCalificacion = (sequelize, DataTypes) => {
  return sequelize.define(
    'ComponenteCalificacion',
    {
      id_componente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_asignatura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ASIGNATURA',
          key: 'id_asignatura',
        },
      },
      id_anio_lectivo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ANIO_LECTIVO',
          key: 'id_anio',
        },
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ponderacion: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        validate: {
          min: 0.0001,
          max: 1,
        },
      },
    },
    {
      tableName: 'COMPONENTE_CALIFICACION',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_componente_asignatura_anio',
          fields: ['id_asignatura', 'id_anio_lectivo', 'nombre'],
        },
      ],
    },
  );
};

module.exports = defineComponenteCalificacion;
