/**
 * Control de intentos fallidos de login + bloqueo temporal + captcha.
 *
 * Guardado en memoria (Map) por email — suficiente para una sola instancia
 * del proceso Node. Si el proyecto llega a correr en varias instancias
 * (cluster/PM2 en modo cluster, balanceador con varios servers), esto debe
 * migrarse a un store compartido (Redis) para que el bloqueo sea consistente
 * entre procesos.
 */

const MAX_INTENTOS = 5;                 // intentos fallidos permitidos
const BLOQUEO_MS    = 2 * 60 * 1000;    // 2 minutos de bloqueo

const intentos = new Map(); // email -> { fallos: number, bloqueadoHasta: number|null }

function normalizar(email) {
    return String(email || '').trim().toLowerCase();
}

function obtenerEstado(email) {
    const key = normalizar(email);
    return intentos.get(key) || { fallos: 0, bloqueadoHasta: null };
}

/** Devuelve { bloqueado, segundosRestantes } */
function verificarBloqueo(email) {
    const estado = obtenerEstado(email);
    if (estado.bloqueadoHasta && estado.bloqueadoHasta > Date.now()) {
        return {
            bloqueado: true,
            segundosRestantes: Math.ceil((estado.bloqueadoHasta - Date.now()) / 1000)
        };
    }
    return { bloqueado: false, segundosRestantes: 0 };
}

/** Registra un intento fallido. Si llega al máximo, activa el bloqueo temporal. */
function registrarFallo(email) {
    const key = normalizar(email);
    const estado = obtenerEstado(email);

    estado.fallos += 1;

    if (estado.fallos >= MAX_INTENTOS) {
        estado.bloqueadoHasta = Date.now() + BLOQUEO_MS;
        estado.fallos = 0; // el contador se reinicia tras aplicar el bloqueo
    }

    intentos.set(key, estado);

    return {
        intentosRestantes: Math.max(MAX_INTENTOS - estado.fallos, 0),
        bloqueado: Boolean(estado.bloqueadoHasta && estado.bloqueadoHasta > Date.now())
    };
}

/** Limpia el contador tras un login exitoso. */
function registrarExito(email) {
    intentos.delete(normalizar(email));
}

// ── Captcha matemático simple (sin dependencias externas) ─────────────────

function generarCaptcha(session) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * 9);
    session.captchaPregunta = `${a} + ${b}`;
    session.captchaRespuesta = a + b;
    return session.captchaPregunta;
}

function verificarCaptcha(session, valorIngresado) {
    const esperado = session.captchaRespuesta;
    const ok = esperado !== undefined
        && String(valorIngresado).trim() === String(esperado);
    // El captcha se consume siempre (éxito o fallo) para evitar reintentos automáticos
    delete session.captchaRespuesta;
    delete session.captchaPregunta;
    return ok;
}

module.exports = {
    MAX_INTENTOS,
    BLOQUEO_MS,
    verificarBloqueo,
    registrarFallo,
    registrarExito,
    generarCaptcha,
    verificarCaptcha
};
