const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//Rutas de servicios

//Ruta post para crear un nuevo servicio
router.post("/", isAuthenticated, isAdmin, serviceController.createService); // POST /api/servicios

//Ruta get para obtener los servicios
router.get("/", serviceController.getAllServices); // GET /api/servicios

//Ruta para eliminar un servicio
router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  serviceController.deleteService
); // DELETE /api/servicios/:id

//ruta para actualizar un servicio
router.put("/:id", isAuthenticated, isAdmin, serviceController.updateService); // PUT /api/servicios/:id
module.exports = router;
