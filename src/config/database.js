require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Conexión a MySQL — reemplaza a spring.datasource.* de application.properties.
 * La BD por defecto sigue siendo "petspadb".
 */
const sequelize = new Sequelize(
    process.env.DB_NAME || 'petspadb',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        timezone: '+00:00',
        // equivalente a spring.jpa.show-sql
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: false,
            freezeTableName: true
        },
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    }
);

module.exports = sequelize;
