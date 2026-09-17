const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Catálogo de permisos del sistema ("Configuración — Permisos por
 * módulo/acción"). Cada fila es una acción concreta (p.ej. VER_CLIENTES)
 * que luego se asocia a uno o varios roles mediante la tabla intermedia
 * rol_permisos.
 */
const Permiso = sequelize.define('Permiso', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // usado en el código: req.authorities.includes('VER_CLIENTES')
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'permisos',
    timestamps: false
});

module.exports = Permiso;
