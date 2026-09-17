require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log('✔ Conexión a MySQL establecida correctamente.');

        // Crea/actualiza las tablas si hace falta (equivale a ddl-auto=update)
        await sequelize.sync();
        console.log('✔ Modelos sincronizados con la base de datos.');

        app.listen(PORT, () => {
            console.log('');
            console.log('  🐾 Coquetos Spa de Mascotas');
            console.log(`  ➜ Panel admin:  http://localhost:${PORT}/`);
            console.log(`  ➜ Web pública:  http://localhost:${PORT}/catalogo`);
            console.log(`  ➜ Login:        http://localhost:${PORT}/login`);
            console.log('');
        });
    } catch (err) {
        console.error('✖ No se pudo iniciar la aplicación:', err.message);
        console.error('  Revisa que MySQL esté corriendo y que las credenciales de .env sean correctas.');
        process.exit(1);
    }
}

iniciar();
