const defineUsuario = (sequelize, DataTypes) => {
  return sequelize.define(
    'Usuario',
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM('COORDINADOR', 'DOCENTE', 'ACUDIENTE'),
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      ultimo_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'USUARIO',
      timestamps: false,
    },
  );
};

module.exports = defineUsuario;
