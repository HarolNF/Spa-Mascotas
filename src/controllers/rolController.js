const { Rol, Permiso, Usuario } = require('../models');

/** Equivale a RolController.java */

/**
 * Agrupa el catálogo de permisos por módulo, para pintar el formulario
 * en secciones (Clientes, Mascotas, Citas, ...) igual que antes.
 * Devuelve: [{ modulo: 'Clientes', permisos: [Permiso, Permiso, ...] }, ...]
 */
function agruparPorModulo(permisos) {
    const grupos = new Map();
    for (const permiso of permisos) {
        if (!grupos.has(permiso.modulo)) grupos.set(permiso.modulo, []);
        grupos.get(permiso.modulo).push(permiso);
    }
    return Array.from(grupos.entries()).map(([modulo, permisos]) => ({ modulo, permisos }));
}

/** IDs de permisos marcados en el formulario (checkboxes name="permisos"). */
function leerPermisoIds(body) {
    if (!body.permisos) return [];
    return Array.isArray(body.permisos) ? body.permisos : [body.permisos];
}

exports.lista = async (req, res, next) => {
    try {
        const roles = await Rol.findAll({
            include: [{ model: Permiso, as: 'permisos' }],
            order: [['id', 'ASC']]
        });
        res.render('roles/lista', {
            pageTitle: 'Roles y Permisos',
            activePage: 'roles',
            roles,
            exito: req.flash('exito')[0] || null,
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.formularioNuevo = async (req, res, next) => {
    try {
        const permisos = await Permiso.findAll({ order: [['modulo', 'ASC'], ['id', 'ASC']] });
        res.render('roles/form', {
            pageTitle: 'Nuevo Rol',
            activePage: 'roles',
            rol: { id: null, nombre: '' },
            permisoIdsAsignados: [],
            gruposPermisos: agruparPorModulo(permisos),
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.guardar = async (req, res, next) => {
    try {
        const existe = await Rol.findOne({ where: { nombre: req.body.nombre } });
        if (existe) {
            req.flash('error', 'Ya existe un rol con ese nombre.');
            return res.redirect('/roles/nuevo');
        }

        const rol = await Rol.create({ nombre: req.body.nombre });
        await rol.setPermisos(leerPermisoIds(req.body));

        req.flash('exito', 'Rol creado correctamente.');
        res.redirect('/roles');
    } catch (err) {
        next(err);
    }
};

exports.formularioEditar = async (req, res, next) => {
    try {
        const [rol, permisos] = await Promise.all([
            Rol.findByPk(req.params.id, { include: [{ model: Permiso, as: 'permisos' }] }),
            Permiso.findAll({ order: [['modulo', 'ASC'], ['id', 'ASC']] })
        ]);
        if (!rol) return res.redirect('/roles');

        res.render('roles/form', {
            pageTitle: 'Editar Rol',
            activePage: 'roles',
            rol,
            permisoIdsAsignados: rol.permisos.map(p => String(p.id)),
            gruposPermisos: agruparPorModulo(permisos),
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const rol = await Rol.findByPk(req.params.id);
        if (!rol) return res.redirect('/roles');

        await rol.update({ nombre: req.body.nombre });
        await rol.setPermisos(leerPermisoIds(req.body));

        req.flash('exito', 'Rol actualizado correctamente.');
        res.redirect('/roles');
    } catch (err) {
        next(err);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const usuarios = await Usuario.count({ where: { rolId: req.params.id } });
        if (usuarios > 0) {
            req.flash('error', `No se puede eliminar: ${usuarios} usuario(s) usan este rol.`);
            return res.redirect('/roles');
        }

        // La fila del rol se elimina; sus asociaciones en rol_permisos se
        // limpian solas gracias al ON DELETE CASCADE del esquema.
        await Rol.destroy({ where: { id: req.params.id } });
        req.flash('exito', 'Rol eliminado correctamente.');
        res.redirect('/roles');
    } catch (err) {
        next(err);
    }
};
