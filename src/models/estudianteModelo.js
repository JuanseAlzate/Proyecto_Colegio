const defineEstudiante = (sequelize, DataTypes) => {
  return sequelize.define(
    'Estudiante',
    {
      id_estudiante: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_persona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'PERSONA',
          key: 'id_persona',
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
      estado: {
        type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'RETIRADO'),
        defaultValue: 'ACTIVO',
      },
      fecha_ingreso: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: 'ESTUDIANTE',
      timestamps: false,
    },
  );
};

module.exports = defineEstudiante;
