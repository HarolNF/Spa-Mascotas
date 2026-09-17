const { Cita, Mascota, Cliente, Servicio } = require('../models');

/** Equivale a CitaController.java */

const INCLUDE_COMPLETO = [
    { model: Mascota, as: 'mascota', include: [{ model: Cliente, as: 'cliente' }] },
    { model: Servicio, as: 'servicios' }
];

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

/** Lista simplificada de mascotas para el autocomplete del formulario. */
async function getMascotasSimplificadas() {
    const mascotas = await Mascota.findAll({
        include: [{ model: Cliente, as: 'cliente' }]
    });
    return mascotas.map(m => ({
        id: m.id,
        nombre: m.nombre,
        especie: m.especie,
        raza: m.raza,
        cliente: m.cliente ? { id: m.cliente.id, nombre: m.cliente.nombre } : null
    }));
}

/** Normaliza servicioIds: puede llegar como string único o array. */
function parseServicioIds(body) {
    return [].concat(body.servicioIds || []).filter(Boolean);
}

// ── Listar ────────────────────────────────────────────────────────────────
exports.listar = async (req, res, next) => {
    try {
        const citas = await Cita.findAll({
            include: INCLUDE_COMPLETO,
            order: [['fecha', 'DESC'], ['hora', 'ASC']]
        });
        res.render('citas/lista', {
            pageTitle: 'Citas',
            activePage: 'citas',
            citas
        });
    } catch (err) {
        next(err);
    }
};

// ── Formulario nueva cita ─────────────────────────────────────────────────
exports.nuevaForm = async (req, res, next) => {
    try {
        const [mascotas, servicios] = await Promise.all([
            getMascotasSimplificadas(),
            Servicio.findAll()
        ]);
        res.render('citas/form', {
            pageTitle: 'Nueva cita',
            activePage: 'citas',
            mascotas,
            servicios,
            hoy: hoyISO(),
            errorFecha: null
        });
    } catch (err) {
        next(err);
    }
};

// ── Guardar nueva cita ────────────────────────────────────────────────────
exports.guardar = async (req, res, next) => {
    const { mascotaId, fecha, hora, responsable, notas } = req.body;
    const servicioIds = parseServicioIds(req.body);

    try {
        // Validar que la fecha no sea anterior a hoy
        if (fecha < hoyISO()) {
            const [mascotas, servicios] = await Promise.all([
                getMascotasSimplificadas(),
                Servicio.findAll()
            ]);
            return res.render('citas/form', {
                pageTitle: 'Nueva cita',
                activePage: 'citas',
                mascotas,
                servicios,
                hoy: hoyISO(),
                errorFecha: 'La fecha no puede ser anterior a hoy.'
            });
        }

        const cita = await Cita.create({
            mascotaId,
            fecha,
            hora,
            responsable: responsable || null,
            notas: notas || null,
            estado: 'PENDIENTE'
        });
        await cita.setServicios(servicioIds);

        res.redirect('/citas');
    } catch (err) {
        next(err);
    }
};

// ── Formulario editar cita ────────────────────────────────────────────────
exports.editarForm = async (req, res, next) => {
    try {
        const cita = await Cita.findByPk(req.params.id, { include: INCLUDE_COMPLETO });
        if (!cita) return res.redirect('/citas');

        // Solo se puede editar si está PENDIENTE o EN_CURSO
        if (cita.estado === 'COMPLETADO' || cita.estado === 'CANCELADO') {
            return res.redirect('/citas');
        }

        const [mascotas, servicios] = await Promise.all([
            getMascotasSimplificadas(),
            Servicio.findAll()
        ]);

        res.render('citas/editar', {
            pageTitle: 'Editar cita',
            activePage: 'citas',
            cita,
            mascotas,
            servicios,
            serviciosSeleccionados: cita.servicios.map(s => String(s.id)),
            hoy: hoyISO(),
            errorFecha: null
        });
    } catch (err) {
        next(err);
    }
};

// ── Guardar edición de cita ───────────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
    const { mascotaId, fecha, hora, responsable, notas } = req.body;
    const servicioIds = parseServicioIds(req.body);

    try {
        const cita = await Cita.findByPk(req.params.id, { include: INCLUDE_COMPLETO });
        if (!cita) return res.redirect('/citas');

        // Validar fecha
        if (fecha < hoyISO()) {
            const [mascotas, servicios] = await Promise.all([
                getMascotasSimplificadas(),
                Servicio.findAll()
            ]);
            return res.render('citas/editar', {
                pageTitle: 'Editar cita',
                activePage: 'citas',
                cita,
                mascotas,
                servicios,
                serviciosSeleccionados: cita.servicios.map(s => String(s.id)),
                hoy: hoyISO(),
                errorFecha: 'La fecha no puede ser anterior a hoy.'
            });
        }

        await cita.update({
            mascotaId,
            fecha,
            hora,
            responsable: responsable || null,
            notas: notas || null
        });
        await cita.setServicios(servicioIds);

        res.redirect('/citas');
    } catch (err) {
        next(err);
    }
};

// ── Cambios de estado ─────────────────────────────────────────────────────
function cambiarEstado(nuevoEstado) {
    return async (req, res, next) => {
        try {
            const cita = await Cita.findByPk(req.params.id);
            if (cita) await cita.update({ estado: nuevoEstado });
            res.redirect('/citas');
        } catch (err) {
            next(err);
        }
    };
}

exports.cancelar  = cambiarEstado('CANCELADO');
exports.completar = cambiarEstado('COMPLETADO');
exports.iniciar   = cambiarEstado('EN_CURSO');

// ── Reprogramar (formulario) ──────────────────────────────────────────────
exports.reprogramarForm = async (req, res, next) => {
    try {
        const cita = await Cita.findByPk(req.params.id, { include: INCLUDE_COMPLETO });
        if (!cita) return res.redirect('/citas');

        if (cita.estado === 'COMPLETADO' || cita.estado === 'CANCELADO') {
            return res.redirect('/citas');
        }

        res.render('citas/reprogramar', {
            pageTitle: 'Reprogramar cita',
            activePage: 'citas',
            cita,
            hoy: hoyISO(),
            errorFecha: null
        });
    } catch (err) {
        next(err);
    }
};

// ── Reprogramar (guardar) ─────────────────────────────────────────────────
exports.reprogramar = async (req, res, next) => {
    const { nuevaFecha, nuevaHora, motivo } = req.body;

    try {
        const cita = await Cita.findByPk(req.params.id, { include: INCLUDE_COMPLETO });
        if (!cita) return res.redirect('/citas');

        // Validar fecha
        if (nuevaFecha < hoyISO()) {
            return res.render('citas/reprogramar', {
                pageTitle: 'Reprogramar cita',
                activePage: 'citas',
                cita,
                hoy: hoyISO(),
                errorFecha: 'La nueva fecha no puede ser anterior a hoy.'
            });
        }

        await cita.update({
            fechaAnterior: cita.fecha,
            horaAnterior: cita.hora,
            motivoReprogramacion: motivo || null,
            vecesReprogramada: (cita.vecesReprogramada || 0) + 1,
            fecha: nuevaFecha,
            hora: nuevaHora,
            estado: 'PENDIENTE'
        });

        res.redirect('/citas');
    } catch (err) {
        next(err);
    }
};
