const { Usuario, Rol } = require('../models');
const { generarToken } = require('../middleware/jwt');
const loginSeguridad = require('../services/loginSeguridad');

/** Equivale a LoginController.java + el formLogin de SecurityConfig. */

/** Duración de la cookie de sesión cuando NO se marca "Recordarme". */
const SESION_NORMAL_MS   = 1000 * 60 * 60 * 8;       // 8 horas
/** Duración de la cookie de sesión cuando SÍ se marca "Recordarme". */
const SESION_RECORDAR_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

exports.mostrarLogin = (req, res) => {
    if (req.usuario) return res.redirect('/');

    const emailPrevio = req.query.email || '';
    const estado = loginSeguridad.verificarBloqueo(emailPrevio);
    // El query ?bloqueado=N (recién llegado del POST) manda sobre el estado
    // recalculado, para mostrar el conteo completo apenas se activa el bloqueo.
    const bloqueado = estado.bloqueado || req.query.bloqueado !== undefined;
    const segundosRestantes = req.query.bloqueado !== undefined
        ? Number(req.query.bloqueado)
        : estado.segundosRestantes;

    res.render('login', {
        layout: false,
        error: req.query.error !== undefined
            ? 'El correo o la contraseña no son correctos.'
            : null,
        errorCaptcha: req.query.errorCaptcha !== undefined
            ? 'La respuesta de verificación no es correcta.'
            : null,
        mensaje: req.query.logout !== undefined
            ? 'Has cerrado sesión correctamente.'
            : (req.query.recuperar !== undefined
                ? 'Si el correo está registrado, te llegarán las instrucciones para recuperar tu contraseña.'
                : null),
        emailPrevio,
        bloqueado,
        segundosRestantes,
        intentosRestantes: req.query.intentos !== undefined ? Number(req.query.intentos) : null,
        captchaPregunta: loginSeguridad.generarCaptcha(req.session)
    });
};

exports.procesarLogin = async (req, res, next) => {
    const { email, password, captcha, recordarme } = req.body;

    try {
        // 1) ¿La cuenta está bloqueada por demasiados intentos fallidos?
        const estadoBloqueo = loginSeguridad.verificarBloqueo(email);
        if (estadoBloqueo.bloqueado) {
            return res.redirect(`/login?error&bloqueado=${estadoBloqueo.segundosRestantes}&email=${encodeURIComponent(email || '')}`);
        }

        // 2) Verificación del captcha (antes de tocar la base de datos)
        const captchaOk = loginSeguridad.verificarCaptcha(req.session, captcha);
        if (!captchaOk) {
            return res.redirect(`/login?errorCaptcha&email=${encodeURIComponent(email || '')}`);
        }

        // 3) Credenciales
        const usuario = await Usuario.findOne({
            where: { email },
            include: [{ model: Rol, as: 'rol' }]
        });

        const passwordOk = usuario && usuario.isEnabled()
            ? await usuario.verificarPassword(password)
            : false;

        if (!usuario || !usuario.isEnabled() || !passwordOk) {
            const resultado = loginSeguridad.registrarFallo(email);
            const extra = resultado.bloqueado
                ? `&bloqueado=${Math.ceil(loginSeguridad.BLOQUEO_MS / 1000)}`
                : `&intentos=${resultado.intentosRestantes}`;
            return res.redirect(`/login?error&email=${encodeURIComponent(email || '')}${extra}`);
        }

        // 4) Login correcto: limpiar contador y crear sesión
        loginSeguridad.registrarExito(email);

        req.session.usuarioId = usuario.id;
        if (recordarme) {
            req.session.cookie.maxAge = SESION_RECORDAR_MS;
        } else {
            req.session.cookie.maxAge = SESION_NORMAL_MS;
        }

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login?logout');
    });
};

// ── Recuperación de contraseña (formulario mínimo, sin envío real de correo) ──
// Nota: aquí sólo se deja el flujo de UI/UX y la validación de entrada.
// Para que funcione de extremo a extremo falta conectar un servicio de correo
// (p. ej. Nodemailer) y una tabla de tokens de recuperación con expiración.

exports.mostrarRecuperar = (req, res) => {
    res.render('recuperar', { layout: false, error: null });
};

exports.procesarRecuperar = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.render('recuperar', {
            layout: false,
            error: 'Ingresa tu correo electrónico.'
        });
    }

    // Por seguridad, la respuesta es siempre la misma exista o no la cuenta,
    // para no revelar qué correos están registrados en el sistema.
    res.redirect('/login?recuperar');
};

// ── API REST con JWT — equivale a ApiAuthController.java ──────────────────

/** POST /api/auth/login → { token, rol, nombre, email } */
exports.apiLogin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y password requeridos' });
    }

    try {
        const usuario = await Usuario.findOne({
            where: { email },
            include: [{ model: Rol, as: 'rol' }]
        });

        if (!usuario || !usuario.isEnabled() || !await usuario.verificarPassword(password)) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({
            token:  generarToken(usuario),
            rol:    usuario.rol,
            nombre: usuario.nombre,
            email:  usuario.email
        });
    } catch (err) {
        next(err);
    }
};

/** GET /api/auth/me → datos del usuario autenticado (requiere Bearer token) */
exports.apiMe = (req, res) => {
    if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    res.json({
        nombre: req.usuario.nombre,
        email:  req.usuario.email,
        rol:    req.usuario.rol
    });
};

/**
 * GET /api/session-check → { logueado: true | false }
 * Equivale a SessionCheckController.java — lo usa el catálogo público.
 */
exports.sessionCheck = (req, res) => {
    res.json({ logueado: Boolean(req.usuario) });
};
