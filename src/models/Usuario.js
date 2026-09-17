const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

/**
 * Equivalente a la entidad JPA Usuario (tabla "usuarios").
 * Sustituye a UserDetails de Spring Security.
 */
const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rolId: {
        type: DataTypes.BIGINT,
        field: 'rol_id',
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'usuarios'
});

/** Compara una contraseña en claro contra el hash BCrypt almacenado. */
Usuario.prototype.verificarPassword = function (passwordPlano) {
    return bcrypt.compare(passwordPlano, this.password);
};

/** Genera el hash BCrypt — reemplaza a BCryptPasswordEncoder.encode(). */
Usuario.hashPassword = function (passwordPlano) {
    return bcrypt.hash(passwordPlano, 10);
};

/** Autoridades del usuario, derivadas de su rol. */
Usuario.prototype.getAuthorities = function () {
    return this.rol ? this.rol.getAuthorities() : [];
};

/** El usuario puede iniciar sesión sólo si está activo (isEnabled/isAccountNonLocked). */
Usuario.prototype.isEnabled = function () {
    return this.activo === true;
};

module.exports = Usuario;
