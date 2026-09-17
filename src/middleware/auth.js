const { Usuario, Rol, Permiso } = require('../models');

/**
 * Sustituye a SecurityConfig.java (SecurityFilterChain web).
 *
 * La sesión guarda sólo el id del usuario; en cada petición recargamos
 * el usuario + rol y exponemos req.usuario / res.locals.usuario a las vistas.
 */

/** Carga el usuario de la sesión en req.usuario y res.locals (para las vistas EJS). */
async function cargarUsuario(req, res, next) {
    res.locals.usuario = null;
    res.locals.authorities = [];
    res.locals.tienePermiso = () => false;

    if (!req.session || !req.session.usuarioId) return next();

    try {
        const usuario = await Usuario.findByPk(req.session.usuarioId, {
            include: [{
                model: Rol,
                as: 'rol',
                include: [{ model: Permiso, as: 'permisos' }]
            }]
        });

        // Si el usuario fue desactivado o eliminado, cerramos la sesión
        if (!usuario || !usuario.isEnabled()) {
            req.session.destroy(() => {});
            return next();
        }

        const authorities = usuario.getAuthorities();

        req.usuario = usuario;
        req.authorities = authorities;

        res.locals.usuario = usuario;
        res.locals.authorities = authorities;
        res.locals.tienePermiso = permiso => authorities.includes(permiso);

        next();
    } catch (err) {
        next(err);
    }
}

/** Exige sesión activa — equivale a .anyRequest().authenticated() */
function requiereLogin(req, res, next) {
    if (!req.usuario) {
        return res.redirect('/login');
    }
    next();
}

/**
 * Exige una autoridad concreta — equivale a .hasAuthority("...")
 * Uso: router.get('/clientes', requierePermiso('VER_CLIENTES'), ...)
 */
function requierePermiso(...permisos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.redirect('/login');
        }
        const tieneAlguno = permisos.some(p => req.authorities.includes(p));
        if (!tieneAlguno) {
            return res.status(403).render('error', {
                pageTitle: 'Acceso denegado',
                activePage: '',
                mensaje: 'No tienes permiso para acceder a esta sección.',
                codigo: 403
            });
        }
        next();
    };
}

module.exports = { cargarUsuario, requiereLogin, requierePermiso };
