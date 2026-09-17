const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Equivalente a la entidad JPA Cita (tabla "citas").
 * Una cita puede incluir múltiples servicios (baño + corte + uñas...)
 * a través de la tabla intermedia "cita_servicios".
 */
const Cita = sequelize.define('Cita', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    mascotaId: {
        type: DataTypes.BIGINT,
        field: 'mascota_id',
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false
    },
    responsable: {
        type: DataTypes.STRING
    },
    notas: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING,          // PENDIENTE, EN_CURSO, COMPLETADO, CANCELADO
        defaultValue: 'PENDIENTE'
    },
    fechaAnterior: {
        type: DataTypes.DATEONLY,
        field: 'fecha_anterior'
    },
    horaAnterior: {
        type: DataTypes.TIME,
        field: 'hora_anterior'
    },
    motivoReprogramacion: {
        type: DataTypes.STRING,
        field: 'motivo_reprogramacion'
    },
    vecesReprogramada: {
        type: DataTypes.INTEGER,
        field: 'veces_reprogramada',
        defaultValue: 0
    }
}, {
    tableName: 'citas'
});

// ── Helpers calculados (equivalen a los métodos @Transient de la entidad Java) ──

/** Precio total sumando todos los servicios de la cita */
Cita.prototype.getTotalPrecio = function () {
    if (!this.servicios) return 0;
    return this.servicios.reduce((suma, s) => suma + (Number(s.precio) || 0), 0);
};

/** Duración total en minutos */
Cita.prototype.getTotalDuracion = function () {
    if (!this.servicios) return 0;
    return this.servicios.reduce((suma, s) => suma + (Number(s.duracionMinutos) || 0), 0);
};

/** Nombres de servicios separados por coma (útil en vistas) */
Cita.prototype.getNombresServicios = function () {
    if (!this.servicios || !this.servicios.length) return '—';
    return this.servicios.map(s => s.nombre).join(', ');
};

/** Compatibilidad: devuelve el primer servicio si existe */
Cita.prototype.getServicio = function () {
    return this.servicios && this.servicios.length ? this.servicios[0] : null;
};

module.exports = Cita;
