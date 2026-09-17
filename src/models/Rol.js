const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Equivalente a la entidad JPA Rol (tabla "roles").
 *
 * Los permisos YA NO viven como columnas booleanas aquí: son un catálogo
 * aparte (modelo Permiso, tabla "permisos") asociado a cada rol mediante
 * la tabla intermedia "rol_permisos" (ver models/index.js).
 */
const Rol = sequelize.define('Rol', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'roles'
});

/**
 * Construye la lista de autoridades (códigos de permiso) a partir de los
 * permisos asociados. Requiere que el rol se haya cargado con
 * `include: [{ model: Permiso, as: 'permisos' }]`; si no se cargó, devuelve
 * un array vacío en vez de fallar.
 */
Rol.prototype.getAuthorities = function () {
    if (!this.permisos) return [];
    return this.permisos.map(p => p.codigo);
};

module.exports = Rol;
