const defineCitacion = (sequelize, DataTypes) => {
  return sequelize.define(
    'Citacion',
    {
      id_citacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_estudiante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ESTUDIANTE',
          key: 'id_estudiante',
        },
      },
      id_acudiente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ACUDIENTE',
          key: 'id_acudiente',
        },
      },
      id_docente_genera: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DOCENTE',
          key: 'id_docente',
        },
      },
      fecha_generacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      motivo: {
        type: DataTypes.ENUM(
          'BAJO_RENDIMIENTO',
          'INASISTENCIAS',
          'COMPORTAMIENTO',
        ),
        allowNull: false,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM(
          'PENDIENTE',
          'ATENDIDA',
          'NO_ATENDIDA',
          'CANCELADA',
        ),
        defaultValue: 'PENDIENTE',
      },
      fecha_atencion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      acta_resumen: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'CITACION',
      timestamps: false,
    },
  );
};

module.exports = defineCitacion;
