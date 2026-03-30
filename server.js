const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session"); // 1️⃣ Importar express-session
require("dotenv").config();
const pool = require("./src/config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Si la app está detrás de un proxy (Heroku, nginx, etc.), permitir que Express
// confíe en el encabezado `X-Forwarded-*` para obtener IP y esquema HTTPS.
// Habilitar cuando `TRUST_PROXY=1` o en producción.
if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Tu dominio
    credentials: true, // IMPORTANTE: Permitir envío de cookies
  }),
);
// Limitar tamaño del body para mitigar payloads gigantes y DoS básicos
const bodyLimit = process.env.REQUEST_LIMIT || "100kb";
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// 2️⃣ Configurar express-session (ANTES de las rutas)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "lorena_braids_secret_key_2025", // Clave secreta para firmar la cookie
    resave: false, // No guardar sesión si no hubo cambios
    saveUninitialized: false, // No crear sesión hasta que se guarde algo
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
      secure: process.env.NODE_ENV === "production", // true solo en producción con HTTPS
      httpOnly: true, // No accesible desde JavaScript del navegador
      sameSite: "strict", // Protección CSRF básica
    },
  }),
);

// Advertencia si no se configuró un secret en producción
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn(
    "WARNING: SESSION_SECRET is not set. Set process.env.SESSION_SECRET before running in production.",
  );
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 3️⃣ Importar rutas de autenticación y middleware
const authRoutes = require("./src/routes/authRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const productoRoutes = require("./src/routes/productoRoutes");
const citaRoutes = require("./src/routes/citaRoutes");
const pagoRoutes = require("./src/routes/pagoRoutes");
const { isAuthenticated, isAdmin } = require("./src/middleware/auth");

// 4️⃣ Usar rutas de autenticación
app.use("/auth", authRoutes); // Todas las rutas empezarán con /auth

app.use("/api/productos", productoRoutes);

app.use("/api/servicios", serviceRoutes);

app.use("/api/citas", citaRoutes);

app.use("/api/pagos", pagoRoutes);

// Rutas de vistas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "index.html"));
});

app.get("/servicios", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "servicios.html"));
});

app.get("/productos", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "productos.html"));
});

app.get("/carrito", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "carrito.html"));
});

app.get("/citas", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "citas.html"));
});

app.get("/agendamiento", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "agendamiento.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "login.html"));
});

app.get("/registro", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "registro.html"));
});

app.get("/sobre-mi", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "sobreMi.html"));
});

// Ruta protegida: Solo admin autenticado puede acceder
app.get("/admin/dashboard", isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "dashboardAdmin.html"));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

  // Probar conexión a PostgreSQL
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Conectado a PostgreSQL");
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message);
  }
});

module.exports = app;
