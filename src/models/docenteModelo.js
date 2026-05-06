const defineDocente = (sequelize, DataTypes) => {
  return sequelize.define(
    'Docente',
    {
      id_docente: {
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
      especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'DOCENTE',
      timestamps: false,
    },
  );
};

module.exports = defineDocente;
