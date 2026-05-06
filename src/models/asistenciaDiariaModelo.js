const defineAsistenciaDiaria = (sequelize, DataTypes) => {
  return sequelize.define(
    'AsistenciaDiaria',
    {
      id_asistencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_matricula: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'MATRICULA',
          key: 'id_matricula',
        },
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM(
          'PRESENTE',
          'AUSENTE_JUSTIFICADO',
          'AUSENTE_INJUSTIFICADO',
        ),
        allowNull: false,
      },
      id_docente_registro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DOCENTE',
          key: 'id_docente',
        },
      },
    },
    {
      tableName: 'ASISTENCIA_DIARIA',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_asistencia_unique',
          fields: ['id_matricula', 'fecha'],
        },
      ],
    },
  );
};

module.exports = defineAsistenciaDiaria;
