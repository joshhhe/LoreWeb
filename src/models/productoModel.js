const pool = require("../config/database");

const productoModel = {
  //Obtener todos los productos
  getAllProducto: async () => {
    try {
      const result = await pool.query(
        "SELECT id_producto AS id, nombre, descripcion, precio, stock FROM productos ORDER BY id_producto ASC"
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  //Crear nuevo producto
  createProducto: async (productoNuevo) => {
    try {
      const { nombre, descripcion, precio, stock } = productoNuevo;
      const result = await pool.query(
        "INSERT INTO productos (nombre,descripcion,precio,stock) VALUES ($1,$2,$3,$4) RETURNING *",
        [nombre, descripcion, precio, stock]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  deleteProducto: async (productoId) => {
    try {
      const result = await pool.query(
        "DELETE FROM productos WHERE id_producto = $1 RETURNING *",
        [productoId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  updateProducto: async (productoId, productoData) => {
    try {
      const { nombre, descripcion, precio, stock } = productoData;
      const result = await pool.query(
        "UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE id_producto = $5 RETURNING *",
        [nombre, descripcion, precio, stock, productoId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
};

module.exports = productoModel;
