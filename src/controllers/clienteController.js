const { Cliente, Mascota, Cita, Servicio } = require('../models');
const { eliminarCitas } = require('../services/citaCascade');

/** Equivale a ClienteController.java */

exports.listar = async (req, res, next) => {
    try {
        const clientes = await Cliente.findAll({
            include: [{ model: Mascota, as: 'mascotas' }],
            order: [['nombre', 'ASC']]
        });
        res.render('clientes/lista', {
            pageTitle: 'Clientes',
            activePage: 'clientes',
            clientes
        });
    } catch (err) {
        next(err);
    }
};

exports.nuevoForm = (req, res) => {
    res.render('clientes/form', {
        pageTitle: 'Cliente',
        activePage: 'clientes',
        cliente: { id: null, nombre: '', email: '', telefono: '', direccion: '', mascotas: [] },
        errores: []
    });
};

exports.guardar = async (req, res, next) => {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        await Cliente.create({
            nombre,
            email: email || null,
            telefono,
            direccion: direccion || null
        });
        res.redirect('/clientes');
    } catch (err) {
        // Errores de validación → volver al formulario mostrando el motivo
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            return res.render('clientes/form', {
                pageTitle: 'Cliente',
                activePage: 'clientes',
                cliente: { id: null, nombre, email, telefono, direccion, mascotas: [] },
                errores: err.errors.map(e => e.message)
            });
        }
        next(err);
    }
};

// ── Editar ───────────────────────────────────────────────────────────────
exports.editarForm = async (req, res, next) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id, {
            include: [{ model: Mascota, as: 'mascotas' }]
        });
        if (!cliente) return res.redirect('/clientes');

        res.render('clientes/form', {
            pageTitle: 'Cliente',
            activePage: 'clientes',
            cliente,
            errores: []
        });
    } catch (err) {
        next(err);
    }
};

exports.actualizar = async (req, res, next) => {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        const cliente = await Cliente.findByPk(req.params.id, {
            include: [{ model: Mascota, as: 'mascotas' }]
        });
        if (!cliente) return res.redirect('/clientes');

        await cliente.update({
            nombre,
            email: email || null,
            telefono,
            direccion: direccion || null
        });
        res.redirect('/clientes');
    } catch (err) {
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const cliente = await Cliente.findByPk(req.params.id, {
                include: [{ model: Mascota, as: 'mascotas' }]
            });
            return res.render('clientes/form', {
                pageTitle: 'Cliente',
                activePage: 'clientes',
                cliente: Object.assign(cliente, { nombre, email, telefono, direccion }),
                errores: err.errors.map(e => e.message)
            });
        }
        next(err);
    }
};

// ── Detalle ──────────────────────────────────────────────────────────────
exports.detalle = async (req, res, next) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id, {
            include: [{ model: Mascota, as: 'mascotas' }]
        });
        if (!cliente) return res.redirect('/clientes');

        // Historial de citas de todas las mascotas del cliente
        const citas = await Cita.findAll({
            include: [
                {
                    model: Mascota,
                    as: 'mascota',
                    required: true,
                    where: { clienteId: cliente.id },
                    include: [{ model: Cliente, as: 'cliente' }]
                },
                { model: Servicio, as: 'servicios' }
            ],
            order: [['fecha', 'DESC']]
        });

        res.render('clientes/detalle', {
            pageTitle: 'Detalle de Cliente',
            activePage: 'clientes',
            cliente,
            citas
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Elimina el cliente en cascada:
 *  1. Citas de cada mascota   2. Mascotas   3. Cliente
 */
exports.eliminar = async (req, res, next) => {
    try {
        const mascotas = await Mascota.findAll({ where: { clienteId: req.params.id } });
        const mascotaIds = mascotas.map(m => m.id);

        if (mascotaIds.length) {
            await eliminarCitas({ mascotaId: mascotaIds });
            await Mascota.destroy({ where: { id: mascotaIds } });
        }
        await Cliente.destroy({ where: { id: req.params.id } });

        res.redirect('/clientes');
    } catch (err) {
        next(err);
    }
};
