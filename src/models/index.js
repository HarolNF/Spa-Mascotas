const sequelize = require('../config/database');

const Cliente  = require('./Cliente');
const Mascota  = require('./Mascota');
const Servicio = require('./Servicio');
const Cita     = require('./Cita');
const Rol      = require('./Rol');
const Permiso  = require('./Permiso');
const Usuario  = require('./Usuario');

// ── Cliente 1..N Mascota ──────────────────────────────────────────────────
Cliente.hasMany(Mascota, {
    foreignKey: { name: 'clienteId', field: 'cliente_id' },
    as: 'mascotas'
});
Mascota.belongsTo(Cliente, {
    foreignKey: { name: 'clienteId', field: 'cliente_id' },
    as: 'cliente'
});

// ── Mascota 1..N Cita ─────────────────────────────────────────────────────
Mascota.hasMany(Cita, {
    foreignKey: { name: 'mascotaId', field: 'mascota_id' },
    as: 'citas'
});
Cita.belongsTo(Mascota, {
    foreignKey: { name: 'mascotaId', field: 'mascota_id' },
    as: 'mascota'
});

// ── Cita N..M Servicio (tabla intermedia cita_servicios) ──────────────────
Cita.belongsToMany(Servicio, {
    through: 'cita_servicios',
    foreignKey: 'cita_id',
    otherKey: 'servicio_id',
    as: 'servicios',
    timestamps: false
});
Servicio.belongsToMany(Cita, {
    through: 'cita_servicios',
    foreignKey: 'servicio_id',
    otherKey: 'cita_id',
    as: 'citas',
    timestamps: false
});

// ── Rol 1..N Usuario ──────────────────────────────────────────────────────
Rol.hasMany(Usuario, {
    foreignKey: { name: 'rolId', field: 'rol_id' },
    as: 'usuarios'
});
Usuario.belongsTo(Rol, {
    foreignKey: { name: 'rolId', field: 'rol_id' },
    as: 'rol'
});

// ── Rol N..M Permiso (tabla intermedia rol_permisos) ───────────────────────
Rol.belongsToMany(Permiso, {
    through: 'rol_permisos',
    foreignKey: 'rol_id',
    otherKey: 'permiso_id',
    as: 'permisos',
    timestamps: false
});
Permiso.belongsToMany(Rol, {
    through: 'rol_permisos',
    foreignKey: 'permiso_id',
    otherKey: 'rol_id',
    as: 'roles',
    timestamps: false
});

module.exports = {
    sequelize,
    Cliente,
    Mascota,
    Servicio,
    Cita,
    Rol,
    Permiso,
    Usuario
};
