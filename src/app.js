require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const { cargarUsuario } = require('./middleware/auth');
const viewHelpers = require('./middleware/viewHelpers');
const routes = require('./routes');

const app = express();

// ── Motor de vistas EJS + layout (reemplaza a Thymeleaf) ─────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');            // views/layout.ejs
app.set('layout extractScripts', false);
app.set('layout extractStyles', false);

// ── Archivos estáticos (antes src/main/resources/static) ─────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Parseo de formularios y JSON ─────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// ── Sesión (reemplaza a JSESSIONID de Spring Security) ───────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'cambia-esta-clave',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8      // 8 horas
    }
}));
app.use(flash());

// ── Usuario y helpers de vista ───────────────────────────────────────────
app.use(viewHelpers);
app.use(cargarUsuario);

// ── Rutas ────────────────────────────────────────────────────────────────
app.use('/', routes);

// ── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('error', {
        pageTitle: 'Página no encontrada',
        activePage: '',
        codigo: 404,
        mensaje: 'La página que buscas no existe.'
    });
});

// ── Manejador de errores ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('✖ Error:', err);
    res.status(500).render('error', {
        pageTitle: 'Error del servidor',
        activePage: '',
        codigo: 500,
        mensaje: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Ocurrió un error inesperado. Inténtalo de nuevo.'
    });
});

module.exports = app;
