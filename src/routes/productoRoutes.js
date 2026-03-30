const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//Rutas de productos

//Ruta post para crear un nuevo producto
router.post("/", isAuthenticated, isAdmin, productoController.createProducto); // POST /api/productos

//Ruta get para obtener los productos
router.get("/", productoController.getAllProductos); // GET /api/productos

//Ruta para eliminar un producto
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  productoController.deleteProducto
); // DELETE /api/productos/:id

//ruta para actualizar un producto
router.put("/:id", isAuthenticated, isAdmin, productoController.updateProducto); // PUT /api/productos/:id

module.exports = router;
