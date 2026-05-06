const defineHorario = (sequelize, DataTypes) => {
  return sequelize.define(
    'Horario',
    {
      id_horario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_docente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DOCENTE',
          key: 'id_docente',
        },
      },
      id_asignatura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ASIGNATURA',
          key: 'id_asignatura',
        },
      },
      id_grupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'GRUPO',
          key: 'id_grupo',
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
      dia_semana: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 7,
        },
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      salon: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'HORARIO',
      timestamps: false,
    },
  );
};

module.exports = defineHorario;
