const definePersona = (sequelize, DataTypes) => {
  return sequelize.define(
    'Persona',
    {
      id_persona: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      genero: {
        type: DataTypes.ENUM('MASCULINO', 'FEMENINO', 'OTRO'),
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'USUARIO',
          key: 'id_usuario',
        },
      },
    },
    {
      tableName: 'PERSONA',
      timestamps: false,
    },
  );
};

module.exports = definePersona;
