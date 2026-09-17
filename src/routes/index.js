const express = require('express');
const router = express.Router();

const { requiereLogin, requierePermiso } = require('../middleware/auth');
const { jwtFilter, requiereJwt } = require('../middleware/jwt');

const authController      = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const catalogoController  = require('../controllers/catalogoController');
const citaController      = require('../controllers/citaController');
const clienteController   = require('../controllers/clienteController');
const mascotaController   = require('../controllers/mascotaController');
const servicioController  = require('../controllers/servicioController');
const rolController       = require('../controllers/rolController');
const usuarioController   = require('../controllers/usuarioController');

// ══ API REST con JWT (stateless) — equivale a la cadena @Order(1) ═════════
router.post('/api/auth/login', authController.apiLogin);
router.get('/api/auth/me', jwtFilter, requiereJwt, authController.apiMe);
router.get('/api/session-check', authController.sessionCheck);

// ══ Rutas públicas ════════════════════════════════════════════════════════
router.get('/login',  authController.mostrarLogin);
router.post('/login', authController.procesarLogin);
router.get('/logout', authController.logout);

router.get ('/recuperar-password', authController.mostrarRecuperar);
router.post('/recuperar-password', authController.procesarRecuperar);

router.get('/catalogo', catalogoController.catalogo);
router.post('/catalogo/reservar', catalogoController.reservar);

// ══ Dashboard ═════════════════════════════════════════════════════════════
router.get('/', requiereLogin, dashboardController.dashboard);

// ══ Citas ═════════════════════════════════════════════════════════════════
router.get('/citas', requierePermiso('VER_CITAS'), citaController.listar);

router.get ('/citas/nueva', requierePermiso('GESTIONAR_CITAS'), citaController.nuevaForm);
router.post('/citas/nueva', requierePermiso('GESTIONAR_CITAS'), citaController.guardar);

router.get ('/citas/:id/editar', requierePermiso('GESTIONAR_CITAS'), citaController.editarForm);
router.post('/citas/:id/editar', requierePermiso('GESTIONAR_CITAS'), citaController.actualizar);

router.post('/citas/:id/cancelar',  requierePermiso('GESTIONAR_CITAS'), citaController.cancelar);
router.post('/citas/:id/completar', requierePermiso('GESTIONAR_CITAS'), citaController.completar);
router.post('/citas/:id/iniciar',   requierePermiso('GESTIONAR_CITAS'), citaController.iniciar);

router.get ('/citas/:id/reprogramar', requierePermiso('GESTIONAR_CITAS'), citaController.reprogramarForm);
router.post('/citas/:id/reprogramar', requierePermiso('GESTIONAR_CITAS'), citaController.reprogramar);

// ══ Clientes ══════════════════════════════════════════════════════════════
router.get('/clientes', requierePermiso('VER_CLIENTES'), clienteController.listar);

router.get ('/clientes/nuevo', requierePermiso('VER_CLIENTES'), clienteController.nuevoForm);
router.post('/clientes/nuevo', requierePermiso('VER_CLIENTES'), clienteController.guardar);

router.get ('/clientes/:id/editar', requierePermiso('VER_CLIENTES'), clienteController.editarForm);
router.post('/clientes/:id/editar', requierePermiso('VER_CLIENTES'), clienteController.actualizar);

router.post('/clientes/:id/eliminar', requierePermiso('ELIMINAR_CLIENTES'), clienteController.eliminar);

router.get('/clientes/:id', requierePermiso('VER_CLIENTES'), clienteController.detalle);

// ══ Mascotas ══════════════════════════════════════════════════════════════
router.get('/mascotas', requierePermiso('VER_MASCOTAS'), mascotaController.listar);

router.get ('/mascotas/nueva', requierePermiso('VER_MASCOTAS'), mascotaController.nuevaForm);
router.post('/mascotas/nueva', requierePermiso('VER_MASCOTAS'), mascotaController.guardar);

router.get ('/mascotas/:id/editar', requierePermiso('VER_MASCOTAS'), mascotaController.editarForm);
router.post('/mascotas/:id/editar', requierePermiso('VER_MASCOTAS'), mascotaController.actualizar);

router.post('/mascotas/:id/eliminar', requierePermiso('VER_MASCOTAS'), mascotaController.eliminar);

// ══ Servicios ═════════════════════════════════════════════════════════════
router.get('/servicios', requierePermiso('VER_SERVICIOS'), servicioController.listar);

router.get ('/servicios/nuevo', requierePermiso('GESTIONAR_SERVICIOS'), servicioController.nuevoForm);
router.post('/servicios/nuevo', requierePermiso('GESTIONAR_SERVICIOS'), servicioController.guardar);

router.get ('/servicios/:id/editar', requierePermiso('GESTIONAR_SERVICIOS'), servicioController.editarForm);
router.post('/servicios/:id/editar', requierePermiso('GESTIONAR_SERVICIOS'), servicioController.actualizar);

router.post('/servicios/:id/eliminar', requierePermiso('GESTIONAR_SERVICIOS'), servicioController.eliminar);

// ══ Roles ═════════════════════════════════════════════════════════════════
router.get ('/roles',       requierePermiso('GESTIONAR_USUARIOS'), rolController.lista);
router.get ('/roles/nuevo', requierePermiso('GESTIONAR_USUARIOS'), rolController.formularioNuevo);
router.post('/roles/nuevo', requierePermiso('GESTIONAR_USUARIOS'), rolController.guardar);

router.get ('/roles/:id/editar', requierePermiso('GESTIONAR_USUARIOS'), rolController.formularioEditar);
router.post('/roles/:id/editar', requierePermiso('GESTIONAR_USUARIOS'), rolController.actualizar);

router.post('/roles/:id/eliminar', requierePermiso('GESTIONAR_USUARIOS'), rolController.eliminar);

// ══ Usuarios ══════════════════════════════════════════════════════════════
router.get ('/usuarios',       requierePermiso('GESTIONAR_USUARIOS'), usuarioController.lista);
router.get ('/usuarios/nuevo', requierePermiso('GESTIONAR_USUARIOS'), usuarioController.formularioNuevo);
router.post('/usuarios/nuevo', requierePermiso('GESTIONAR_USUARIOS'), usuarioController.guardar);

router.get ('/usuarios/:id/editar', requierePermiso('GESTIONAR_USUARIOS'), usuarioController.formularioEditar);
router.post('/usuarios/:id/editar', requierePermiso('GESTIONAR_USUARIOS'), usuarioController.actualizar);

router.post('/usuarios/:id/toggle', requierePermiso('GESTIONAR_USUARIOS'), usuarioController.toggleActivo);

module.exports = router;
