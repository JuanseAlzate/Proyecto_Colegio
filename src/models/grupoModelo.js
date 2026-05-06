const defineGrupo = (sequelize, DataTypes) => {
  return sequelize.define(
    'Grupo',
    {
      id_grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      id_grado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'GRADO',
          key: 'id_grado',
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
    },
    {
      tableName: 'GRUPO',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_grupo_anio',
          fields: ['id_grado', 'id_anio_lectivo', 'nombre'],
        },
      ],
    },
  );
};

module.exports = defineGrupo;
