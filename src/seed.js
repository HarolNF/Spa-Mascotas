require('dotenv').config();
const { sequelize, Cliente, Mascota, Servicio, Cita, Rol, Permiso, Usuario } = require('./models');

/** Catálogo de permisos — "Configuración: permisos por módulo/acción". */
const CATALOGO_PERMISOS = [
    { codigo: 'VER_CLIENTES',        nombre: 'Ver clientes',                   modulo: 'Clientes',       descripcion: 'Consultar el listado de clientes' },
    { codigo: 'ELIMINAR_CLIENTES',   nombre: 'Eliminar clientes',              modulo: 'Clientes',       descripcion: 'Eliminar registros de clientes' },
    { codigo: 'VER_MASCOTAS',        nombre: 'Ver y gestionar mascotas',       modulo: 'Mascotas',       descripcion: 'Consultar y administrar mascotas' },
    { codigo: 'VER_CITAS',           nombre: 'Ver citas',                      modulo: 'Citas',          descripcion: 'Consultar el listado de citas' },
    { codigo: 'GESTIONAR_CITAS',     nombre: 'Crear/editar/cancelar citas',    modulo: 'Citas',          descripcion: 'Administrar el ciclo de vida de las citas' },
    { codigo: 'VER_SERVICIOS',       nombre: 'Ver catálogo de servicios',      modulo: 'Servicios',      descripcion: 'Consultar el catálogo de servicios' },
    { codigo: 'GESTIONAR_SERVICIOS', nombre: 'Crear/editar/eliminar servicios',modulo: 'Servicios',      descripcion: 'Administrar el catálogo de servicios' },
    { codigo: 'GESTIONAR_USUARIOS',  nombre: 'Gestionar usuarios y roles',     modulo: 'Administración', descripcion: 'Acceso total a usuarios y roles' },
    { codigo: 'VER_EMPLEADOS',       nombre: 'Ver empleados',                  modulo: 'Empleados',      descripcion: 'Consultar el listado de empleados' },
    { codigo: 'GESTIONAR_EMPLEADOS', nombre: 'Gestionar empleados',            modulo: 'Empleados',      descripcion: 'Administrar empleados' },
    { codigo: 'VER_PAGOS',           nombre: 'Ver pagos',                      modulo: 'Pagos',          descripcion: 'Consultar pagos de clientes' },
    { codigo: 'GESTIONAR_PAGOS',     nombre: 'Gestionar pagos',                modulo: 'Pagos',          descripcion: 'Registrar y administrar pagos' },
    { codigo: 'VER_PRODUCTOS',       nombre: 'Ver productos',                  modulo: 'Productos',      descripcion: 'Consultar productos e inventario' },
    { codigo: 'GESTIONAR_PRODUCTOS', nombre: 'Gestionar productos',            modulo: 'Productos',      descripcion: 'Administrar productos e inventario' },
    { codigo: 'VER_RESENAS',         nombre: 'Ver reseñas',                    modulo: 'Reseñas',        descripcion: 'Consultar reseñas de clientes' },
    { codigo: 'GESTIONAR_RESENAS',   nombre: 'Gestionar reseñas',              modulo: 'Reseñas',        descripcion: 'Moderar y responder reseñas' },
    { codigo: 'VER_TURNOS',          nombre: 'Ver turnos',                     modulo: 'Turnos',         descripcion: 'Consultar turnos del personal' },
    { codigo: 'GESTIONAR_TURNOS',    nombre: 'Gestionar turnos',               modulo: 'Turnos',         descripcion: 'Administrar turnos del personal' }
];

/**
 * Carga inicial de datos — equivale a DataInitializer.java (CommandLineRunner).
 * Se ejecuta con: npm run seed
 */
function diasAtras(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

async function seed() {
    await sequelize.authenticate();
    console.log('✔ Conectado a MySQL');

    // Crea las tablas si aún no existen (respetando el esquema de los modelos)
    await sequelize.sync();

    // ── 1. Catálogo de permisos ─────────────────────────────────────────
    const permisosPorCodigo = {};
    for (const datos of CATALOGO_PERMISOS) {
        const [permiso] = await Permiso.findOrCreate({
            where: { codigo: datos.codigo },
            defaults: datos
        });
        permisosPorCodigo[datos.codigo] = permiso;
    }
    console.log(`✔ Catálogo de permisos: ${CATALOGO_PERMISOS.length} permisos`);

    // ── 2. Roles por defecto + sus permisos asignados ───────────────────
    const [rolAdmin] = await Rol.findOrCreate({ where: { nombre: 'ADMIN' } });
    await rolAdmin.setPermisos(Object.values(permisosPorCodigo)); // ADMIN: todos los permisos

    const [rolRecepcionista] = await Rol.findOrCreate({ where: { nombre: 'RECEPCIONISTA' } });
    await rolRecepcionista.setPermisos([
        permisosPorCodigo.VER_CLIENTES,
        permisosPorCodigo.VER_MASCOTAS,
        permisosPorCodigo.VER_CITAS,
        permisosPorCodigo.GESTIONAR_CITAS
    ]);

    console.log('✔ Roles configurados: ADMIN (todos los permisos), RECEPCIONISTA (clientes/mascotas/citas)');

    // ── 3. Usuarios por defecto ────────────────────────────────────────
    if (!await Usuario.findOne({ where: { email: 'admin@spamascots.com' } })) {
        await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@spamascots.com',
            password: await Usuario.hashPassword('admin123'),
            rolId: rolAdmin.id
        });
        console.log('✔ Admin creado: admin@spamascots.com / admin123');
    }

    if (!await Usuario.findOne({ where: { email: 'recepcion@spamascots.com' } })) {
        await Usuario.create({
            nombre: 'Recepcionista',
            email: 'recepcion@spamascots.com',
            password: await Usuario.hashPassword('recep123'),
            rolId: rolRecepcionista.id
        });
        console.log('✔ Recepcionista creado: recepcion@spamascots.com / recep123');
    }

    // ── 4. Datos de prueba (solo si la BD está vacía) ─────────────────
    if (await Servicio.count() > 0) {
        console.log('✔ Datos ya existentes — seed de prueba omitido.');
        await sequelize.close();
        return;
    }

    const bano   = await Servicio.create({ nombre: 'Baño completo',   descripcion: 'Baño, secado y perfumado',     duracionMinutos: 45, precio: 45.00,  icono: '🛁' });
    const corte  = await Servicio.create({ nombre: 'Corte de pelo',   descripcion: 'Corte estilo y acabado',       duracionMinutos: 60, precio: 60.00,  icono: '✂️' });
    const unias  = await Servicio.create({ nombre: 'Corte de uñas',   descripcion: 'Limado y recorte',             duracionMinutos: 20, precio: 20.00,  icono: '💅' });
    const spa    = await Servicio.create({ nombre: 'Spa completo',    descripcion: 'Baño + Corte + Uñas + Masaje', duracionMinutos: 90, precio: 110.00, icono: '⭐' });
    const dental = await Servicio.create({ nombre: 'Limpieza dental', descripcion: 'Higiene bucal profesional',    duracionMinutos: 30, precio: 35.00,  icono: '🦷' });

    const ana    = await Cliente.create({ nombre: 'Ana García',   email: 'ana@gmail.com',    telefono: '987-123-456' });
    const carlos = await Cliente.create({ nombre: 'Carlos Pérez', email: 'cperez@mail.com',  telefono: '987-654-321' });
    const maria  = await Cliente.create({ nombre: 'María López',  email: 'mlopez@mail.com',  telefono: '912-345-678' });
    const luis   = await Cliente.create({ nombre: 'Luis Torres',  email: 'ltorres@mail.com', telefono: '934-567-890' });

    const mochi = await Mascota.create({ nombre: 'Mochi', especie: 'Perro',  raza: 'Pomerania',        edad: 2, genero: 'Hembra', clienteId: ana.id,    fechaRegistro: hoyISO(), estado: 'ACTIVO', ultimaVisita: diasAtras(5) });
    const luna  = await Mascota.create({ nombre: 'Luna',  especie: 'Gato',   raza: 'Siamés',           edad: 3, genero: 'Hembra', clienteId: carlos.id, fechaRegistro: hoyISO(), estado: 'ACTIVO', ultimaVisita: diasAtras(8) });
    const rocky = await Mascota.create({ nombre: 'Rocky', especie: 'Perro',  raza: 'Golden Retriever', edad: 4, genero: 'Macho',  clienteId: maria.id,  fechaRegistro: hoyISO(), estado: 'ACTIVO', ultimaVisita: diasAtras(12) });
    const coco  = await Mascota.create({ nombre: 'Coco',  especie: 'Conejo', raza: 'Angora',           edad: 1, genero: 'Macho',  clienteId: luis.id,   fechaRegistro: hoyISO(), estado: 'ACTIVO' });

    const c1 = await Cita.create({ mascotaId: mochi.id, fecha: hoyISO(),     hora: '10:00:00', responsable: 'Sofía R.',  estado: 'PENDIENTE' });
    const c2 = await Cita.create({ mascotaId: luna.id,  fecha: hoyISO(),     hora: '11:30:00', responsable: 'Javier M.', estado: 'EN_CURSO' });
    const c3 = await Cita.create({ mascotaId: rocky.id, fecha: hoyISO(),     hora: '14:00:00', responsable: 'Sofía R.',  estado: 'PENDIENTE' });
    const c4 = await Cita.create({ mascotaId: coco.id,  fecha: diasAtras(1), hora: '09:00:00', responsable: 'Javier M.', estado: 'COMPLETADO' });

    await c1.setServicios([bano.id, corte.id]);
    await c2.setServicios([unias.id]);
    await c3.setServicios([spa.id]);
    await c4.setServicios([bano.id]);

    console.log('✔ Datos de prueba cargados exitosamente.');
    console.log(`  Servicios: ${await Servicio.count()} · Clientes: ${await Cliente.count()} · Mascotas: ${await Mascota.count()} · Citas: ${await Cita.count()}`);
    console.log(`  (dental cargado con id ${dental.id})`);

    await sequelize.close();
}

seed().catch(err => {
    console.error('✖ Error en el seed:', err);
    process.exit(1);
});
