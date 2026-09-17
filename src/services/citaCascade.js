const { Cita, Servicio } = require('../models');

/**
 * Elimina citas junto con sus filas de la tabla intermedia cita_servicios.
 *
 * La FK de cita_servicios no tiene ON DELETE CASCADE en bases de datos
 * creadas por Hibernate, así que hay que vaciar la relación N..M antes
 * de borrar la cita (es lo que hacía JPA con @ManyToMany).
 */
async function eliminarCitas(where) {
    const citas = await Cita.findAll({ where, include: [{ model: Servicio, as: 'servicios' }] });
    if (!citas.length) return 0;

    // 1. Desvincular los servicios (vacía cita_servicios)
    for (const cita of citas) {
        await cita.setServicios([]);
    }

    // 2. Ahora sí se pueden borrar las citas
    await Cita.destroy({ where: { id: citas.map(c => c.id) } });
    return citas.length;
}

module.exports = { eliminarCitas };
