const pool = require("../config/database");

const pagoModel = {
  //obtener orden por id
  getOrdenById: async (id_orden) => {
    try {
      const result = await pool.query(
        "SELECT id_orden, estado, total FROM ordenes WHERE id_orden = $1",
        [id_orden],
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error obteniendo orden por id:", error);
      throw error;
    }
  },

  //crear orden de pago e insertar en tabla ordenes
  createOrden: async (cabezera) => {
    const {
      id_usuario,
      total,
      estado,
      nombre,
      direccion,
      rut,
      telefono,
      metodo_envio,
      ciudad,
      comuna,
      postal,
      shipping_cost,
    } = cabezera;
    try {
      const result = await pool.query(
        "INSERT INTO ordenes (id_usuario, total, estado, metodo_envio, shipping_cost, nombre, rut, telefono, direccion, ciudad, comuna, postal) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",
        [
          id_usuario,
          total,
          estado,
          metodo_envio,
          shipping_cost,
          nombre,
          rut,
          telefono,
          direccion,
          ciudad,
          comuna,
          postal,
        ],
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  //guardar detalles orden en tabla ordenes_detalles
  createOrdenDetalles: async (detalles) => {
    const {
      id_orden,
      id_producto,
      cantidad,
      precio,
      nombre_producto,
      subtotal,
    } = detalles;
    try {
      const result = await pool.query(
        "INSERT INTO ordenes_detalles (id_orden, id_producto, cantidad, precio, nombre_producto, subtotal) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [id_orden, id_producto, cantidad, precio, nombre_producto, subtotal],
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating order details:", error);
      throw error;
    }
  },

  //actualizar estado de orden en tabla ordenes
  updateOrdenEstado: async (id_orden, estado) => {
    try {
      const result = await pool.query(
        "UPDATE ordenes SET estado = $1 WHERE id_orden = $2 RETURNING *",
        [estado, id_orden],
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error actualizando estado de la orden:", error);
      throw error;
    }
  },
};

module.exports = pagoModel;
