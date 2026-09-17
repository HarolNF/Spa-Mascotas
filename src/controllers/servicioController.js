const { Servicio, Cita } = require('../models');
const { eliminarCitas } = require('../services/citaCascade');

/** Equivale a ServicioController.java */

exports.listar = async (req, res, next) => {
    try {
        const servicios = await Servicio.findAll({ order: [['id', 'ASC']] });
        res.render('servicios/lista', {
            pageTitle: 'Servicios',
            activePage: 'servicios',
            servicios
        });
    } catch (err) {
        next(err);
    }
};

exports.nuevoForm = (req, res) => {
    res.render('servicios/form', {
        pageTitle: 'Servicio',
        activePage: 'servicios',
        servicio: { id: null, nombre: '', icono: '', descripcion: '', duracionMinutos: '', precio: '' }
    });
};

exports.guardar = async (req, res, next) => {
    const { nombre, icono, descripcion, duracionMinutos, precio } = req.body;
    try {
        await Servicio.create({
            nombre,
            icono,
            descripcion: descripcion || null,
            duracionMinutos: duracionMinutos ? Number(duracionMinutos) : null,
            precio: precio || null
        });
        res.redirect('/servicios');
    } catch (err) {
        next(err);
    }
};

exports.editarForm = async (req, res, next) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) return res.redirect('/servicios');

        res.render('servicios/form', {
            pageTitle: 'Servicio',
            activePage: 'servicios',
            servicio
        });
    } catch (err) {
        next(err);
    }
};

exports.actualizar = async (req, res, next) => {
    const { nombre, icono, descripcion, duracionMinutos, precio } = req.body;
    try {
        const servicio = await Servicio.findByPk(req.params.id);
        if (!servicio) return res.redirect('/servicios');

        await servicio.update({
            nombre,
            icono,
            descripcion: descripcion || null,
            duracionMinutos: duracionMinutos ? Number(duracionMinutos) : null,
            precio: precio || null
        });
        res.redirect('/servicios');
    } catch (err) {
        next(err);
    }
};

/** Elimina el servicio junto con las citas que lo usan (evita violar la FK). */
exports.eliminar = async (req, res, next) => {
    try {
        const servicio = await Servicio.findByPk(req.params.id, {
            include: [{ model: Cita, as: 'citas' }]
        });
        if (!servicio) return res.redirect('/servicios');

        // 1. Eliminar primero todas las citas que usen este servicio
        const citaIds = servicio.citas.map(c => c.id);
        if (citaIds.length) {
            await eliminarCitas({ id: citaIds });
        }
        // 2. Ahora sí eliminar el servicio
        await servicio.destroy();

        res.redirect('/servicios');
    } catch (err) {
        next(err);
    }
};
