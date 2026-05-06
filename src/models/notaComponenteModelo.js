const defineNotaComponente = (sequelize, DataTypes) => {
  return sequelize.define(
    'NotaComponente',
    {
      id_nota_componente: {
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
      id_componente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'COMPONENTE_CALIFICACION',
          key: 'id_componente',
        },
      },
      id_periodo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PERIODO',
          key: 'id_periodo',
        },
      },
      valor: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      fecha_registro: {
        type: DataTypes.DATEONLY,
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
      tableName: 'NOTA_COMPONENTE',
      timestamps: false,
      indexes: [
        {
          unique: true,
          name: 'uk_nota_unique',
          fields: ['id_matricula', 'id_componente', 'id_periodo'],
        },
      ],
    },
  );
};

module.exports = defineNotaComponente;
