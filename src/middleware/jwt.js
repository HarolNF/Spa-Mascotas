require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Usuario, Rol, Permiso } = require('../models');

const SECRET     = process.env.JWT_SECRET || 'SpaMascotasClaveSecretaJWT2024CambiarEnProduccion';
const EXPIRACION = Number(process.env.JWT_EXPIRATION) || 86400; // segundos

/** Genera un token — equivale a JwtService.generateToken(). */
function generarToken(usuario) {
    return jwt.sign(
        {
            sub: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol ? usuario.rol.nombre : null
        },
        SECRET,
        { expiresIn: EXPIRACION }
    );
}

/** Valida y decodifica un token; devuelve null si es inválido o expiró. */
function verificarToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Equivale a JwtFilter.java — lee el header "Authorization: Bearer <token>",
 * valida y adjunta el usuario a req.usuario. No corta la petición si no hay
 * token; de eso se encarga requiereJwt.
 */
async function jwtFilter(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const payload = verificarToken(authHeader.substring(7));
    if (!payload) return next();

    try {
        const usuario = await Usuario.findOne({
            where: { email: payload.sub },
            include: [{
                model: Rol,
                as: 'rol',
                include: [{ model: Permiso, as: 'permisos' }]
            }]
        });

        if (usuario && usuario.isEnabled()) {
            req.usuario = usuario;
            req.authorities = usuario.getAuthorities();
        }
        next();
    } catch (err) {
        next(err);
    }
}

/** Exige un token válido — para las rutas /api protegidas. */
function requiereJwt(req, res, next) {
    if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    next();
}

module.exports = { generarToken, verificarToken, jwtFilter, requiereJwt };
