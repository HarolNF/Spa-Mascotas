/**
 * Helpers disponibles en todas las vistas EJS.
 * Sustituyen a las expresiones de Thymeleaf (#lists, th:classappend, ?: ...).
 */
function viewHelpers(req, res, next) {

    /** Clase CSS del badge según el estado de la cita. */
    res.locals.claseEstado = function (estado) {
        switch (estado) {
            case 'COMPLETADO': return 'status status--done';
            case 'EN_CURSO':   return 'status status--active';
            case 'CANCELADO':  return 'status status--cancel';
            default:           return 'status status--pending';
        }
    };

    /** Formatea una hora "10:00:00" → "10:00". */
    res.locals.fmtHora = function (hora) {
        if (!hora) return '—';
        return String(hora).slice(0, 5);
    };

    /** Formatea una fecha (Date o "YYYY-MM-DD") → "YYYY-MM-DD". */
    res.locals.fmtFecha = function (fecha) {
        if (!fecha) return '—';
        if (fecha instanceof Date) return fecha.toISOString().slice(0, 10);
        return String(fecha).slice(0, 10);
    };

    /** Formatea un precio → "45.00". */
    res.locals.fmtPrecio = function (valor) {
        const n = Number(valor);
        return isNaN(n) ? '0.00' : n.toFixed(2);
    };

    /** Devuelve el valor, o un guion largo si está vacío. */
    res.locals.oGuion = function (valor) {
        return (valor === null || valor === undefined || valor === '') ? '—' : valor;
    };

    next();
}

module.exports = viewHelpers;
