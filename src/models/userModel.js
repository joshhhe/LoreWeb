const pool = require("../config/database");

// Modelo de Usuario de ejemplo
const User = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo usuario
  create: async (userData) => {
    const { nombre, email, password } = userData;
    try {
      const result = await pool.query(
        "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING *",
        [nombre, email, password]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  update: async (id, userData) => {
    const { nombre, email } = userData;
    try {
      const result = await pool.query(
        "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *",
        [nombre, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    try {
      await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
      return { message: "Usuario eliminado correctamente" };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = User;
