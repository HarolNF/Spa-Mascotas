const { Mascota, Cliente, Cita } = require('../models');
const { eliminarCitas } = require('../services/citaCascade');

/** Equivale a MascotaController.java */

exports.listar = async (req, res, next) => {
    try {
        const mascotas = await Mascota.findAll({
            include: [{ model: Cliente, as: 'cliente' }],
            order: [['nombre', 'ASC']]
        });
        res.render('mascotas/lista', {
            pageTitle: 'Mascotas',
            activePage: 'mascotas',
            mascotas
        });
    } catch (err) {
        next(err);
    }
};

/** Acepta ?clienteId=X opcional (viene del botón "Agregar mascota" del cliente). */
exports.nuevaForm = async (req, res, next) => {
    try {
        const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
        res.render('mascotas/form', {
            pageTitle: 'Mascota',
            activePage: 'mascotas',
            mascota: {
                id: null, nombre: '', especie: '', raza: '',
                tamano: '', edad: '', genero: ''
            },
            clientes,
            clientePreseleccionado: req.query.clienteId || null,
            errores: []
        });
    } catch (err) {
        next(err);
    }
};

exports.guardar = async (req, res, next) => {
    const { nombre, especie, raza, tamano, edad, genero, clienteId } = req.body;
    try {
        await Mascota.create({
            nombre,
            especie,
            raza: raza || null,
            tamano: tamano || null,
            edad: edad ? Number(edad) : null,
            genero: genero || null,
            clienteId: clienteId || null,
            fechaRegistro: new Date().toISOString().slice(0, 10),
            estado: 'ACTIVO'
        });
        res.redirect('/mascotas');
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
            return res.render('mascotas/form', {
                pageTitle: 'Mascota',
                activePage: 'mascotas',
                mascota: { id: null, nombre, especie, raza, tamano, edad, genero },
                clientes,
                clientePreseleccionado: clienteId || null,
                errores: err.errors.map(e => e.message)
            });
        }
        next(err);
    }
};

exports.editarForm = async (req, res, next) => {
    try {
        const [mascota, clientes] = await Promise.all([
            Mascota.findByPk(req.params.id, { include: [{ model: Cliente, as: 'cliente' }] }),
            Cliente.findAll({ order: [['nombre', 'ASC']] })
        ]);
        if (!mascota) return res.redirect('/mascotas');

        res.render('mascotas/form', {
            pageTitle: 'Mascota',
            activePage: 'mascotas',
            mascota,
            clientes,
            clientePreseleccionado: mascota.clienteId || null,
            errores: []
        });
    } catch (err) {
        next(err);
    }
};

exports.actualizar = async (req, res, next) => {
    const { nombre, especie, raza, tamano, edad, genero, clienteId } = req.body;
    try {
        const mascota = await Mascota.findByPk(req.params.id);
        if (!mascota) return res.redirect('/mascotas');

        // estado, fechaRegistro y ultimaVisita se conservan al editar
        await mascota.update({
            nombre,
            especie,
            raza: raza || null,
            tamano: tamano || null,
            edad: edad ? Number(edad) : null,
            genero: genero || null,
            clienteId: clienteId || null
        });
        res.redirect('/mascotas');
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });
            return res.render('mascotas/form', {
                pageTitle: 'Mascota',
                activePage: 'mascotas',
                mascota: { id: req.params.id, nombre, especie, raza, tamano, edad, genero },
                clientes,
                clientePreseleccionado: clienteId || null,
                errores: err.errors.map(e => e.message)
            });
        }
        next(err);
    }
};

/** Elimina la mascota junto con todas sus citas asociadas (evita violar la FK). */
exports.eliminar = async (req, res, next) => {
    try {
        await eliminarCitas({ mascotaId: req.params.id });
        await Mascota.destroy({ where: { id: req.params.id } });
        res.redirect('/mascotas');
    } catch (err) {
        next(err);
    }
};
