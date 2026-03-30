const pool = require("../config/database");

const citaModel = {
  //Obtener todas las citas
  getAllCitas: async () => {
    try {
      const result = await pool.query(
        "SELECT c.id_cita, c.id_usuario, c.id_servicio, c.fecha_cita, c.hora_cita, c.estado,u.nombre AS nombre_usuario,u.telefono AS telefono_usuario,s.nombre AS nombre_servicio,s.precio FROM citas c INNER JOIN usuarios u ON c.id_usuario = u.id_usuario INNER JOIN servicios s ON c.id_servicio = s.id_servicio ORDER BY c.fecha_cita DESC, c.hora_cita DESC",
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener todas las citas: ${error.message}`);
    }
  },

  //Crear nueva cita
  createCita: async (citaData) => {
    try {
      const { id_usuario, id_servicio, fecha_cita, hora_cita, estado } =
        citaData;
      const result = await pool.query(
        "INSERT INTO citas (id_usuario, id_servicio, fecha_cita, hora_cita, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [id_usuario, id_servicio, fecha_cita, hora_cita, estado],
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear cita: ${error.message}`);
    }
  },

  //Eliminar cita por ID
  deleteCita: async (citaId) => {
    try {
      const result = await pool.query(
        "DELETE FROM citas WHERE id_cita = $1 RETURNING *",
        [citaId],
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar cita: ${error.message}`);
    }
  },

  //Actualizar cita por ID
  updateCita: async (citaId, citaData) => {
    try {
      const { id_usuario, id_servicio, fecha_cita, hora_cita, estado } =
        citaData;
      const result = await pool.query(
        "UPDATE citas SET  id_servicio = $1, fecha_cita = $2, hora_cita = $3, estado = $4 WHERE id_cita = $5 RETURNING *",
        [id_servicio, fecha_cita, hora_cita, estado, citaId],
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar cita: ${error.message}`);
    }
  },

  // Obtener cita por ID
  getCitaById: async (citaId) => {
    try {
      const result = await pool.query(
        "SELECT id_cita, id_usuario, id_servicio, fecha_cita, hora_cita, estado FROM citas WHERE id_cita = $1",
        [citaId],
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener cita por ID: ${error.message}`);
    }
  },

  // Obtener citas por ID de usuario
  getCitasByUsuariuo: async (id_usuario) => {
    try {
      const result = await pool.query(
        "SELECT id_cita, id_servicio, fecha_cita, hora_cita, estado FROM citas WHERE id_usuario = $1",
        [id_usuario],
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener citas por usuario: ${error.message}`);
    }
  },

  getCitasByEstado: async (estado) => {
    // "pendiente", "confirmada", "completada", "cancelada"
    try {
      const result = await pool.query(
        "SELECT id_cita, id_usuario, id_servicio, fecha_cita, hora_cita, estado FROM citas WHERE estado = $1",
        [estado],
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener citas por estado: ${error.message}`);
    }
  },

  //verificar disponibilidad de citas por fecha y hora

  verificarCitasDisponibles: async (fecha_cita, hora_cita) => {
    try {
      const result = await pool.query(
        "SELECT COUNT(*) AS count FROM citas WHERE fecha_cita = $1 AND hora_cita = $2 AND estado != 'cancelada'",
        [fecha_cita, hora_cita],
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  },

  updateEstadoCitas: async (citaId, nuevoEstado) => {
    try {
      // 1. Actualizar el estado
      await pool.query("UPDATE citas SET estado = $1 WHERE id_cita = $2", [
        nuevoEstado,
        citaId,
      ]);

      // 2. Obtener los datos completos con INNER JOIN
      const result = await pool.query(
        `SELECT 
          c.id_cita, 
          c.fecha_cita, 
          c.hora_cita, 
          c.estado,
          u.nombre AS nombre_usuario,
          u.telefono AS telefono_usuario,
          u.email AS email_usuario,
          s.nombre AS nombre_servicio,
          s.precio
         FROM citas c
         INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
         INNER JOIN servicios s ON c.id_servicio = s.id_servicio
         WHERE c.id_cita = $1`,
        [citaId],
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  },

  //
};
module.exports = citaModel;
