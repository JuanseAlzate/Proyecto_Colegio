const defineAcudiente = (sequelize, DataTypes) => {
  return sequelize.define(
    'Acudiente',
    {
      id_acudiente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_persona: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'persona',
          key: 'id_persona',
        },
      },
      parentesco: {
        type: DataTypes.ENUM('PADRE', 'MADRE', 'TUTOR', 'OTRO'),
        allowNull: false,
      },
    },
    {
      tableName: 'acudiente',
      timestamps: false,
    },
  );
};

module.exports = defineAcudiente;
