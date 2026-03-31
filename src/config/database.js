require("dotenv").config(); // Cargar variables de entorno
const { Pool } = require("pg");

// Configuración de la conexión a PostgreSQL
/*const pool = new Pool({
  user: process.env.DB_USER || "tu_usuario",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "lorena_db",
  password: process.env.DB_PASSWORD || "tu_contraseña",
  port: process.env.DB_PORT || 5432,
});*/

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      user: process.env.DB_USER || "tu_usuario",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "lorena_db",
      password: process.env.DB_PASSWORD || "tu_contraseña",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    };

const pool = new Pool(poolConfig);
pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error en la conexión con PostgreSQL:", err);
  process.exit(-1);
});

module.exports = pool;
