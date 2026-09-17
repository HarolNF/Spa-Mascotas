const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/** Equivalente a la entidad JPA Servicio (tabla "servicios"). */
const Servicio = sequelize.define('Servicio', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    icono: {
        type: DataTypes.STRING           // emoji mostrado en las vistas
    },
    descripcion: {
        type: DataTypes.STRING
    },
    duracionMinutos: {
        type: DataTypes.INTEGER,
        field: 'duracion_minutos'
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        // MySQL devuelve DECIMAL como string; lo normalizamos a número
        get() {
            const valor = this.getDataValue('precio');
            return valor === null || valor === undefined ? null : parseFloat(valor);
        }
    }
}, {
    tableName: 'servicios'
});

module.exports = Servicio;
