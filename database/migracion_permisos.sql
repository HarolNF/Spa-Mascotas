-- ══════════════════════════════════════════════════════════════════════════
--  Migración: de "roles con columnas booleanas" a "permisos + rol_permisos"
--
--  Úsalo SOLO si ya tenías la base de datos creada con el schema.sql viejo
--  (roles con columnas ver_clientes, gestionar_citas, etc). Si vas a crear
--  la base de datos desde cero, simplemente corre el schema.sql actualizado
--  y luego `npm run seed` — no necesitas este archivo.
--
--  Uso:  mysql -u root -p petspadb < database/migracion_permisos.sql
-- ══════════════════════════════════════════════════════════════════════════

USE petspadb;

-- 1) Crear las tablas nuevas (si no existen todavía)
CREATE TABLE IF NOT EXISTS permisos (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    codigo      VARCHAR(100) NOT NULL,
    nombre      VARCHAR(150) NOT NULL,
    modulo      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permisos_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id     BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    KEY fk_rp_permiso (permiso_id),
    CONSTRAINT fk_rp_rol     FOREIGN KEY (rol_id)     REFERENCES roles (id)    ON DELETE CASCADE,
    CONSTRAINT fk_rp_permiso FOREIGN KEY (permiso_id) REFERENCES permisos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Cargar el catálogo de permisos (mismos módulos que existían como columnas)
INSERT IGNORE INTO permisos (codigo, nombre, modulo, descripcion) VALUES
    ('VER_CLIENTES',        'Ver clientes',                  'Clientes',   'Consultar el listado de clientes'),
    ('ELIMINAR_CLIENTES',   'Eliminar clientes',             'Clientes',   'Eliminar registros de clientes'),
    ('VER_MASCOTAS',        'Ver y gestionar mascotas',      'Mascotas',   'Consultar y administrar mascotas'),
    ('VER_CITAS',           'Ver citas',                     'Citas',      'Consultar el listado de citas'),
    ('GESTIONAR_CITAS',     'Crear/editar/cancelar citas',   'Citas',      'Administrar el ciclo de vida de las citas'),
    ('VER_SERVICIOS',       'Ver catálogo de servicios',     'Servicios',  'Consultar el catálogo de servicios'),
    ('GESTIONAR_SERVICIOS', 'Crear/editar/eliminar servicios','Servicios', 'Administrar el catálogo de servicios'),
    ('GESTIONAR_USUARIOS',  'Gestionar usuarios y roles',    'Administración', 'Acceso total a usuarios y roles'),
    ('VER_EMPLEADOS',       'Ver empleados',                 'Empleados',  'Consultar el listado de empleados'),
    ('GESTIONAR_EMPLEADOS', 'Gestionar empleados',           'Empleados',  'Administrar empleados'),
    ('VER_PAGOS',           'Ver pagos',                     'Pagos',      'Consultar pagos de clientes'),
    ('GESTIONAR_PAGOS',     'Gestionar pagos',               'Pagos',      'Registrar y administrar pagos'),
    ('VER_PRODUCTOS',       'Ver productos',                 'Productos',  'Consultar productos e inventario'),
    ('GESTIONAR_PRODUCTOS', 'Gestionar productos',           'Productos',  'Administrar productos e inventario'),
    ('VER_RESENAS',         'Ver reseñas',                   'Reseñas',    'Consultar reseñas de clientes'),
    ('GESTIONAR_RESENAS',   'Gestionar reseñas',             'Reseñas',    'Moderar y responder reseñas'),
    ('VER_TURNOS',          'Ver turnos',                    'Turnos',     'Consultar turnos del personal'),
    ('GESTIONAR_TURNOS',    'Gestionar turnos',              'Turnos',     'Administrar turnos del personal');

-- 3) Migrar cada bandera booleana existente a una fila en rol_permisos
--    (se ejecuta solo si la tabla roles todavía tiene las columnas viejas)
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_CLIENTES'        WHERE r.ver_clientes        = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'ELIMINAR_CLIENTES'   WHERE r.eliminar_clientes   = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_MASCOTAS'        WHERE r.ver_mascotas        = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_CITAS'           WHERE r.ver_citas           = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_CITAS'     WHERE r.gestionar_citas     = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_SERVICIOS'       WHERE r.ver_servicios       = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_SERVICIOS' WHERE r.gestionar_servicios = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_USUARIOS'  WHERE r.gestionar_usuarios  = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_EMPLEADOS'       WHERE r.ver_empleados       = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_EMPLEADOS' WHERE r.gestionar_empleados = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_PAGOS'           WHERE r.ver_pagos           = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_PAGOS'     WHERE r.gestionar_pagos     = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_PRODUCTOS'       WHERE r.ver_productos       = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_PRODUCTOS' WHERE r.gestionar_productos = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_RESENAS'         WHERE r.ver_resenas         = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_RESENAS'   WHERE r.gestionar_resenas   = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'VER_TURNOS'          WHERE r.ver_turnos          = 1;
INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r JOIN permisos p ON p.codigo = 'GESTIONAR_TURNOS'    WHERE r.gestionar_turnos    = 1;

-- 4) Recién cuando confirmes que rol_permisos quedó bien poblada, elimina las
--    columnas booleanas viejas de "roles" (se deja comentado a propósito).
-- ALTER TABLE roles
--     DROP COLUMN ver_clientes,        DROP COLUMN ver_mascotas,
--     DROP COLUMN ver_citas,           DROP COLUMN gestionar_citas,
--     DROP COLUMN ver_servicios,       DROP COLUMN gestionar_servicios,
--     DROP COLUMN eliminar_clientes,   DROP COLUMN gestionar_usuarios,
--     DROP COLUMN ver_empleados,       DROP COLUMN gestionar_empleados,
--     DROP COLUMN ver_pagos,           DROP COLUMN gestionar_pagos,
--     DROP COLUMN ver_productos,       DROP COLUMN gestionar_productos,
--     DROP COLUMN ver_resenas,         DROP COLUMN gestionar_resenas,
--     DROP COLUMN ver_turnos,          DROP COLUMN gestionar_turnos;
