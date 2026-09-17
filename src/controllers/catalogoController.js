const { Cliente, Mascota, Servicio, Cita } = require('../models');

/** Equivale a CatalogoController.java — web pública. */

/** GET /catalogo */
exports.catalogo = async (req, res, next) => {
    try {
        const servicios = await Servicio.findAll();
        res.render('catalogo', {
            layout: false,
            servicios,
            hoy: new Date().toISOString().slice(0, 10),
            mensajeExito: req.flash('mensajeExito')[0] || null,
            mensajeError: req.flash('mensajeError')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

/** POST /catalogo/reservar — reserva pública sin sesión. */
exports.reservar = async (req, res, next) => {
    const {
        nombreMascota, especie, raza, tamano,
        fecha, hora, nombreCliente, telefono, notas
    } = req.body;

    // servicioIds llega como string si se marcó uno solo, o array si fueron varios
    const servicioIds = []
        .concat(req.body.servicioIds || [])
        .filter(Boolean);

    try {
        // Validar fecha no anterior a hoy
        const hoy = new Date().toISOString().slice(0, 10);
        if (fecha < hoy) {
            req.flash('mensajeError', 'La fecha de la cita no puede ser anterior a hoy.');
            return res.redirect('/catalogo');
        }

        if (!servicioIds.length) {
            req.flash('mensajeError', 'Debes seleccionar al menos un servicio.');
            return res.redirect('/catalogo');
        }

        // 1. Buscar o crear cliente por teléfono
        let cliente = await Cliente.findOne({ where: { telefono } });
        if (!cliente) {
            cliente = await Cliente.create({ nombre: nombreCliente, telefono });
        }

        // 2. Crear mascota
        const mascota = await Mascota.create({
            nombre: nombreMascota,
            especie,
            raza: raza || null,
            tamano: tamano || null,
            clienteId: cliente.id,
            fechaRegistro: hoy,
            estado: 'ACTIVO'
        });

        // 3. Crear cita con los servicios seleccionados
        const cita = await Cita.create({
            mascotaId: mascota.id,
            fecha,
            hora,
            responsable: nombreCliente,
            notas: notas || null,
            estado: 'PENDIENTE'
        });
        await cita.setServicios(servicioIds);

        req.flash('mensajeExito',
            '¡Reserva recibida! 🐾 Nos comunicaremos contigo pronto para confirmar tu cita.');
        res.redirect('/catalogo');
    } catch (err) {
        next(err);
    }
};
