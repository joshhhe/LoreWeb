const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

const createAdmin = async () => {
  // 🔧 CAMBIA ESTOS VALORES
  const nombre = "Administrador";
  const email = "admin@lorenabraids.com";
  const password = "trenzasondina";
  const rol = "admin";
  const telefono = "0000000000";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING  nombre, email, rol",
      [nombre, email, hashedPassword, telefono, rol]
    );

    console.log("\n✅ Admin creado exitosamente:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ID:", result.rows[0].id);
    console.log("Nombre:", result.rows[0].nombre);
    console.log("Email:", result.rows[0].email);
    console.log("Rol:", result.rows[0].rol);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔑 Credenciales para login:");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    if (error.code === "23505") {
      console.error(
        "\n❌ Error: Este email ya está registrado en la base de datos"
      );
    } else {
      console.error("\n❌ Error al crear admin:", error.message);
    }
    process.exit(1);
  }
};

createAdmin();
