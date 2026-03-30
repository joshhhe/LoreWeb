const pool = require("../config/database");

const ServiceModel = {
  // Obtener todos los servicios
  getAllServices: async () => {
    try {
      const result = await pool.query(
        "SELECT id_servicio as id, nombre, descripcion,duracion_minutos,precio FROM servicios ORDER BY id_servicio ASC"
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo servicio
  createService: async (serviceData) => {
    try {
      const { nombre, descripcion, duracion_minutos, precio } = serviceData;
      const result = await pool.query(
        "INSERT INTO servicios(nombre,descripcion,duracion_minutos,precio) VALUES($1,$2,$3,$4) RETURNING *",
        [nombre, descripcion, duracion_minutos, precio]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Eliminar servicio por ID
  deleteService: async (serviceId) => {
    try {
      const result = await pool.query(
        "DELETE FROM servicios WHERE id_servicio = $1 RETURNING *",
        [serviceId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Actualizar servicio por ID

  updateService: async (serviceId, serviceData) => {
    try {
      const { nombre, descripcion, duracion_minutos, precio } = serviceData;
      const result = await pool.query(
        "UPDATE servicios SET nombre = $1, descripcion = $2, duracion_minutos = $3, precio = $4 WHERE id_servicio = $5 RETURNING *",
        [nombre, descripcion, duracion_minutos, precio, serviceId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ServiceModel;
