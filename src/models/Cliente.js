const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Equivalente a la entidad JPA Cliente (tabla "clientes"). */
const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es obligatorio' }
        }
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmailOrEmpty(value) {
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error('Debe ser un email válido');
                }
            }
        }
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El teléfono es obligatorio' }
        }
    },
    direccion: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'clientes'
});

module.exports = Cliente;
