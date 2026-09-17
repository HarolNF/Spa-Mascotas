# 🐾 Coquetos Spa de Mascotas

Sistema de gestión para spa de mascotas: panel administrativo + web pública de reservas.

** Node.js + Express + Sequelize + MySQL.**

---

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + Express 4 |
| Base de datos | MySQL 8 (`petspadb`) |
| ORM | Sequelize 6 |
| Vistas | EJS + express-ejs-layouts |
| CSS | **Bootstrap 5.3** + **Tailwind CSS** (prefijo `tw-`) + `public/css/style.css` propio |
| Iconos | Font Awesome 6 + emojis |
| Sesiones | express-session + connect-flash |
| API | JWT (jsonwebtoken) |
| Contraseñas | bcryptjs |

> **Sobre los frameworks CSS:** el proyecto ya venía con **Bootstrap 5.3** y **Font Awesome** (usados en el catálogo y el login). En la migración se añadió **Tailwind** vía CDN, configurado con el prefijo `tw-` y `preflight` desactivado para que **no choque** con Bootstrap ni con los estilos propios del panel.

---

## 🚀 Instalación

### 1. Requisitos
- Node.js 18 o superior
- MySQL 8 en marcha

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno

Copia `.env.example` a `.env` y ajusta tus credenciales de MySQL:

```bash
cp .env.example .env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petspadb
DB_USER=root
DB_PASSWORD=tu_password
SESSION_SECRET=cambia-esta-clave
JWT_SECRET=cambia-esta-clave-jwt
```

### 4. Crear la base de datos

```bash
mysql -u root -p < database/schema.sql
```

> Si ya tenías la base de datos creada con la versión anterior del esquema
> (roles con columnas booleanas tipo `ver_clientes`), corre en su lugar la
> migración que agrega el catálogo de permisos normalizado:
> ```bash
> mysql -u root -p petspadb < database/migracion_permisos.sql
> ```

### 5. Cargar datos iniciales (permisos, roles, usuarios y datos de prueba)

```bash
npm run seed
```

### 6. Arrancar

```bash
npm run dev
```

| | |
|---|---|
| Panel admin | http://localhost:3000/ |
| Web pública | http://localhost:3000/catalogo |
| Login | http://localhost:3000/login |

---

## 👤 Usuarios por defecto

| Email | Contraseña | Rol |
|---|---|---|
| `admin@spamascots.com` | `admin123` | ADMIN (todos los permisos) |
| `recepcion@spamascots.com` | `recep123` | RECEPCIONISTA |

---

## 📁 Estructura

```
├── database/
│   └── schema.sql              # Esquema MySQL completo
├── public/                     # Estáticos (antes src/main/resources/static)
│   ├── css/style.css
│   ├── js/app.js
│   └── img/
├── views/                      # Plantillas EJS (antes templates/ Thymeleaf)
│   ├── layout.ejs              # Layout del panel (sidebar + topbar)
│   ├── login.ejs               # Standalone (sin layout)
│   ├── catalogo.ejs            # Web pública (sin layout)
│   ├── dashboard.ejs
│   ├── error.ejs
│   ├── citas/  clientes/  mascotas/  servicios/  roles/  usuarios/
└── src/
    ├── server.js               # Punto de entrada
    ├── app.js                  # Configuración de Express
    ├── seed.js                 # Datos iniciales (antes DataInitializer.java)
    ├── config/database.js      # Conexión Sequelize
    ├── models/                 # Entidades (antes model/*.java con JPA)
    ├── controllers/            # Lógica (antes controller/*.java)
    ├── routes/index.js         # Rutas y permisos (antes SecurityConfig.java)
    ├── services/
    │   └── citaCascade.js      # Borrado en cascada de citas
    └── middleware/
        ├── auth.js             # Sesión y permisos
        ├── jwt.js              # API con JWT
        └── viewHelpers.js      # Helpers para las vistas
```

---

## 🔐 Permisos

Los permisos viven en un catálogo propio (tabla `permisos`) y se asocian a
cada rol mediante la tabla intermedia `rol_permisos` — el rol ya no guarda
los permisos como columnas booleanas. Un usuario hereda los permisos de su
rol a través de esa relación N..M.

```
roles ──< rol_permisos >── permisos
```

| Permiso | Da acceso a |
|---|---|
| `VER_CLIENTES` | Listar, ver y editar clientes |
| `ELIMINAR_CLIENTES` | Eliminar clientes (en cascada) |
| `VER_MASCOTAS` | Módulo de mascotas |
| `VER_CITAS` | Ver el listado de citas |
| `GESTIONAR_CITAS` | Crear, editar, iniciar, completar, cancelar y reprogramar |
| `VER_SERVICIOS` | Ver el catálogo de servicios |
| `GESTIONAR_SERVICIOS` | Crear, editar y eliminar servicios |
| `GESTIONAR_USUARIOS` | Panel de usuarios y roles |
| `VER_EMPLEADOS` / `GESTIONAR_EMPLEADOS` | Módulo de empleados |
| `VER_PAGOS` / `GESTIONAR_PAGOS` | Módulo de pagos |
| `VER_PRODUCTOS` / `GESTIONAR_PRODUCTOS` | Módulo de productos |
| `VER_RESENAS` / `GESTIONAR_RESENAS` | Módulo de reseñas |
| `VER_TURNOS` / `GESTIONAR_TURNOS` | Módulo de turnos |

El formulario de `/roles/nuevo` y `/roles/:id/editar` renderiza sus
checkboxes dinámicamente a partir del catálogo (`Permiso.findAll()`), así
que agregar un permiso nuevo en la base de datos lo hace aparecer solo en
el formulario, sin tocar el HTML.

---

## 🌐 Rutas

### Públicas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/login` · `/logout` | Acceso al panel |
| GET | `/catalogo` | Web pública |
| POST | `/catalogo/reservar` | Reserva desde la web |

### Panel
| Método | Ruta |
|---|---|
| GET | `/` — Dashboard |
| GET/POST | `/citas` · `/citas/nueva` · `/citas/:id/editar` |
| POST | `/citas/:id/{iniciar,completar,cancelar}` |
| GET/POST | `/citas/:id/reprogramar` |
| GET/POST | `/clientes` · `/clientes/nuevo` · `/clientes/:id/editar` · `/clientes/:id` |
| POST | `/clientes/:id/eliminar` |
| GET/POST | `/mascotas` · `/mascotas/nueva` · `/mascotas/:id/editar` |
| POST | `/mascotas/:id/eliminar` |
| GET/POST | `/servicios` · `/servicios/nuevo` · `/servicios/:id/editar` |
| POST | `/servicios/:id/eliminar` |
| GET/POST | `/roles` · `/roles/nuevo` · `/roles/:id/editar` |
| GET/POST | `/usuarios` · `/usuarios/nuevo` · `/usuarios/:id/editar` |
| POST | `/usuarios/:id/toggle` |

### API REST (JWT)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | `{email, password}` → `{token, rol, nombre, email}` |
| GET | `/api/auth/me` | Requiere `Authorization: Bearer <token>` |
| GET | `/api/session-check` | `{logueado: true\|false}` |

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spamascots.com","password":"admin123"}'
```

---

## 🔄 Equivalencias con la versión Spring Boot

| Spring Boot | Node.js |
|---|---|
| `application.properties` | `.env` + `src/config/database.js` |
| Entidades JPA `@Entity` | Modelos Sequelize (`src/models/`) |
| `JpaRepository` | Métodos del modelo (`findAll`, `findByPk`, `destroy`...) |
| `@Controller` | `src/controllers/` |
| `SecurityConfig` | `src/routes/index.js` + `middleware/auth.js` |
| `JwtFilter` / `JwtService` | `src/middleware/jwt.js` |
| `DataInitializer` | `src/seed.js` |
| Thymeleaf (`th:each`, `th:if`) | EJS (`<% forEach %>`, `<% if %>`) |
| `sec:authorize` | `<% if (tienePermiso('...')) %>` |
| `BCryptPasswordEncoder` | `bcryptjs` (hashes compatibles) |
| `ddl-auto=update` | `database/schema.sql` + `sequelize.sync()` |

Los hashes BCrypt existentes siguen siendo válidos: **no hace falta que los
usuarios cambien su contraseña.**

---

## 📜 Scripts

```bash
npm start     # Producción
npm run dev   # Desarrollo con nodemon
npm run seed  # Cargar roles, usuarios y datos de prueba
```
