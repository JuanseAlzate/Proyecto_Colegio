const defineMatricula = (sequelize, DataTypes) => {
  return sequelize.define(
    'Matricula',
    {
      id_matricula: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_estudiante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiante',
          key: 'id_estudiante',
        },
      },
      id_grupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'grupo',
          key: 'id_grupo',
        },
      },
      id_anio_lectivo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'anio_lectivo',
          key: 'id_anio',
        },
      },
      fecha_matricula: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('ACTIVA', 'RETIRADO'),
        defaultValue: 'ACTIVA',
      },
    },
    {
      tableName: 'matricula',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_matricula_estudiante_anio',
          fields: ['id_estudiante', 'id_anio_lectivo'],
        },
      ],
    },
  );
};

module.exports = defineMatricula;
