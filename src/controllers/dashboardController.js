const { Op } = require('sequelize');
const { Cita, Cliente, Mascota, Servicio } = require('../models');

/** Equivale a DashboardController.java — GET / */
exports.dashboard = async (req, res, next) => {
    try {
        const hoy = new Date().toISOString().slice(0, 10);

        const [totalMascotas, totalClientes, citasHoy, citasPendientes] = await Promise.all([
            Mascota.count(),
            Cliente.count(),
            Cita.count({ where: { fecha: hoy, estado: { [Op.ne]: 'CANCELADO' } } }),
            Cita.count({ where: { estado: 'PENDIENTE' } })
        ]);

        // Citas del día ordenadas por hora (incluye las creadas desde el catálogo)
        const citasDelDia = await Cita.findAll({
            where: { fecha: hoy },
            include: [
                { model: Mascota, as: 'mascota', include: [{ model: Cliente, as: 'cliente' }] },
                { model: Servicio, as: 'servicios' }
            ],
            order: [['hora', 'ASC']]
        });

        res.render('dashboard', {
            pageTitle: 'Dashboard',
            activePage: 'dashboard',
            totalMascotas,
            totalClientes,
            citasHoy,
            citasPendientes,
            citasDelDia
        });
    } catch (err) {
        next(err);
    }
};
