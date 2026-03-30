//modelo para tener la estructura de datos de autenticación
const pool = require("../config/database");

const AuthModel = {
  //verificar si existe usuario con email
  findUserByEmail: async (email) => {
    try {
      const result = await pool.query(
        "SELECT id_usuario as id, nombre, email, password_hash, telefono, rol FROM usuarios WHERE email = $1",
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  //Crea nuevo usuario
  createUser: async (nombre, email, hashedPassword, telefono, rol) => {
    try {
      const result = await pool.query(
        "INSERT INTO usuarios (nombre,email,password_hash,telefono,rol) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [nombre, email, hashedPassword, telefono, rol]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
};

module.exports = AuthModel;
