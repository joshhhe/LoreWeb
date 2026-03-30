const { success } = require("zod");
const productoModel = require("../models/productoModel");

const productoController = {
  //Obtener todos los productos
  getAllProductos: async (req, res) => {
    try {
      const productos = await productoModel.getAllProducto();

      if (productos.length > 0) {
        res.status(200).json({
          success: true,
          message: "Productos obtenidos exitosamente",
          productos: productos,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No hay productos disponibles",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener productos" });
    }
  },

  //Crear nuevo producto
  createProducto: async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock } = req.body;
      if (!nombre || !precio || !stock) {
        return res
          .status(400)
          .json({ success: false, message: "Faltan campos obligatorios" });
      }

      const productoData = {
        nombre,
        descripcion: descripcion || "",
        precio,
        stock,
      };
      const response = await productoModel.createProducto(productoData);
      if (response) {
        res.status(201).json({
          success: true,
          message: "Producto creado exitosamente",
          producto: {
            nombre: response.nombre,
            descripcion: response.descripcion,
            precio: response.precio,
            stock: response.stock,
          },
        });
      } else {
        res.status(500).json({ error: "Error al crear producto" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al crear producto" });
    }
  },

  //Eliminar producto
  deleteProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const response = await productoModel.deleteProducto(id);
      if (response) {
        res.status(200).json({
          success: true,
          message: "Producto eliminado correctamente",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar producto" });
    }
  },

  //Actualizar producto
  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const productoData = req.body;
      const response = await productoModel.updateProducto(id, productoData);
      if (response) {
        res.status(200).json({
          success: true,
          message: "Producto actualizado correctamente",
          producto: response,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar producto" });
    }
  },
};

module.exports = productoController;
