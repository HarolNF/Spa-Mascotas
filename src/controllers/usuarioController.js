const { Usuario, Rol } = require('../models');

/** Equivale a UsuarioController.java */

exports.lista = async (req, res, next) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{ model: Rol, as: 'rol' }],
            order: [['id', 'ASC']]
        });
        res.render('usuarios/lista', {
            pageTitle: 'Usuarios',
            activePage: 'usuarios',
            usuarios,
            exito: req.flash('exito')[0] || null,
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.formularioNuevo = async (req, res, next) => {
    try {
        const roles = await Rol.findAll({ order: [['nombre', 'ASC']] });
        res.render('usuarios/form', {
            pageTitle: 'Nuevo Usuario',
            activePage: 'usuarios',
            usuario: { id: null, nombre: '', email: '', activo: true, rol: null, rolId: null },
            roles,
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.guardar = async (req, res, next) => {
    const { nombre, email, password, rolId } = req.body;
    try {
        if (await Usuario.findOne({ where: { email } })) {
            req.flash('error', 'Ya existe un usuario con ese email.');
            return res.redirect('/usuarios/nuevo');
        }

        await Usuario.create({
            nombre,
            email,
            password: await Usuario.hashPassword(password),
            rolId
        });

        req.flash('exito', 'Usuario creado correctamente.');
        res.redirect('/usuarios');
    } catch (err) {
        next(err);
    }
};

exports.formularioEditar = async (req, res, next) => {
    try {
        const [usuario, roles] = await Promise.all([
            Usuario.findByPk(req.params.id, { include: [{ model: Rol, as: 'rol' }] }),
            Rol.findAll({ order: [['nombre', 'ASC']] })
        ]);
        if (!usuario) return res.redirect('/usuarios');

        res.render('usuarios/form', {
            pageTitle: 'Editar Usuario',
            activePage: 'usuarios',
            usuario,
            roles,
            error: req.flash('error')[0] || null
        });
    } catch (err) {
        next(err);
    }
};

exports.actualizar = async (req, res, next) => {
    const { nombre, email, password, rolId, activo } = req.body;
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.redirect('/usuarios');

        const cambios = {
            nombre,
            email,
            rolId,
            activo: activo !== undefined
        };

        // Contraseña vacía = mantener la actual
        if (password && password.trim()) {
            cambios.password = await Usuario.hashPassword(password);
        }

        await usuario.update(cambios);
        req.flash('exito', 'Usuario actualizado correctamente.');
        res.redirect('/usuarios');
    } catch (err) {
        next(err);
    }
};

exports.toggleActivo = async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) return res.redirect('/usuarios');

        await usuario.update({ activo: !usuario.activo });
        req.flash('exito', `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente.`);
        res.redirect('/usuarios');
    } catch (err) {
        next(err);
    }
};
