const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Equivalente a la entidad JPA Mascota (tabla "mascotas"). */
const Mascota = sequelize.define('Mascota', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es obligatorio' },
            len: { args: [2, 50], msg: 'El nombre debe tener entre 2 y 50 caracteres' }
        }
    },
    especie: {
        type: DataTypes.STRING,          // Perro, Gato, Conejo...
        validate: { notEmpty: { msg: 'La especie es obligatoria' } }
    },
    raza: {
        type: DataTypes.STRING
    },
    tamano: {
        type: DataTypes.STRING
    },
    edad: {
        type: DataTypes.INTEGER
    },
    genero: {
        type: DataTypes.STRING
    },
    fechaRegistro: {
        type: DataTypes.DATEONLY,
        field: 'fecha_registro',
        defaultValue: () => new Date().toISOString().slice(0, 10)
    },
    ultimaVisita: {
        type: DataTypes.DATEONLY,
        field: 'ultima_visita'
    },
    estado: {
        type: DataTypes.STRING,          // ACTIVO, INACTIVO
        defaultValue: 'ACTIVO'
    },
    clienteId: {
        type: DataTypes.BIGINT,
        field: 'cliente_id'
    }
}, {
    tableName: 'mascotas'
});

module.exports = Mascota;
