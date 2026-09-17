-- ══════════════════════════════════════════════════════════════════════════
--  Coquetos Spa de Mascotas — Esquema de base de datos MySQL
--  Reemplaza a la generación automática de Hibernate (ddl-auto=update).
--
--  Uso:  mysql -u root -p < database/schema.sql
-- ══════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS petspadb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE petspadb;

-- ── Roles ────────────────────────────────────────────────────────────────
-- "Configuración — Perfiles de acceso": el rol ya NO guarda los permisos
-- como columnas booleanas; los permisos viven en su propio catálogo
-- (tabla `permisos`) y se asocian al rol mediante la tabla de relación
-- `rol_permisos`.
CREATE TABLE IF NOT EXISTS roles (
    id     BIGINT       NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Permisos ─────────────────────────────────────────────────────────────
-- "Configuración — Permisos por módulo/acción": catálogo único de acciones
-- posibles en el sistema (independiente de qué rol las tenga asignadas).
CREATE TABLE IF NOT EXISTS permisos (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    codigo      VARCHAR(100) NOT NULL,   -- p.ej. 'VER_CLIENTES', usado en el código
    nombre      VARCHAR(150) NOT NULL,   -- etiqueta legible, p.ej. 'Ver clientes'
    modulo      VARCHAR(100) NOT NULL,   -- agrupador visual, p.ej. 'Clientes'
    descripcion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permisos_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Rol_Permisos ─────────────────────────────────────────────────────────
-- "Relación — Asociación de roles y permisos": tabla intermedia N..M.
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id     BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    KEY fk_rp_permiso (permiso_id),
    CONSTRAINT fk_rp_rol     FOREIGN KEY (rol_id)     REFERENCES roles (id)    ON DELETE CASCADE,
    CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id) REFERENCES permisos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Usuarios ─────────────────────────────────────────────────────────────
-- "Sujeto — Usuarios y autenticación"
CREATE TABLE IF NOT EXISTS usuarios (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    nombre   VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id   BIGINT       NOT NULL,
    activo   TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_email (email),
    KEY fk_usuarios_rol (rol_id),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Clientes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
    id        BIGINT       NOT NULL AUTO_INCREMENT,
    nombre    VARCHAR(255) NOT NULL,
    email     VARCHAR(255) DEFAULT NULL,
    telefono  VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_clientes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Servicios ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servicios (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    nombre           VARCHAR(255) DEFAULT NULL,
    icono            VARCHAR(255) DEFAULT NULL,
    descripcion      VARCHAR(255) DEFAULT NULL,
    duracion_minutos INT          DEFAULT NULL,
    precio           DECIMAL(10,2) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Mascotas ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mascotas (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(255) NOT NULL,
    especie        VARCHAR(255) DEFAULT NULL,
    raza           VARCHAR(255) DEFAULT NULL,
    tamano         VARCHAR(255) DEFAULT NULL,
    edad           INT          DEFAULT NULL,
    genero         VARCHAR(255) DEFAULT NULL,
    fecha_registro DATE         DEFAULT NULL,
    ultima_visita  DATE         DEFAULT NULL,
    estado         VARCHAR(255) DEFAULT 'ACTIVO',
    cliente_id     BIGINT       DEFAULT NULL,
    PRIMARY KEY (id),
    KEY fk_mascotas_cliente (cliente_id),
    CONSTRAINT fk_mascotas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Citas ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    mascota_id             BIGINT       NOT NULL,
    fecha                  DATE         NOT NULL,
    hora                   TIME         NOT NULL,
    responsable            VARCHAR(255) DEFAULT NULL,
    notas                  VARCHAR(255) DEFAULT NULL,
    estado                 VARCHAR(255) DEFAULT 'PENDIENTE',
    fecha_anterior         DATE         DEFAULT NULL,
    hora_anterior          TIME         DEFAULT NULL,
    motivo_reprogramacion  VARCHAR(255) DEFAULT NULL,
    veces_reprogramada     INT          DEFAULT 0,
    PRIMARY KEY (id),
    KEY fk_citas_mascota (mascota_id),
    CONSTRAINT fk_citas_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla intermedia Cita N..M Servicio ──────────────────────────────────
CREATE TABLE IF NOT EXISTS cita_servicios (
    cita_id     BIGINT NOT NULL,
    servicio_id BIGINT NOT NULL,
    PRIMARY KEY (cita_id, servicio_id),
    KEY fk_cs_servicio (servicio_id),
    CONSTRAINT fk_cs_cita     FOREIGN KEY (cita_id)     REFERENCES citas (id)     ON DELETE CASCADE,
    CONSTRAINT fk_cs_servicio FOREIGN KEY (servicio_id) REFERENCES servicios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
