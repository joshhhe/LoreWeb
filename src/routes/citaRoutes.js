const express = require("express");
const router = express.Router();
const citaController = require("../controllers/citaController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.get("/", isAdmin, citaController.getAllCitas); // GET /api/citas
router.post("/", isAuthenticated, citaController.createCita); // POST /api/citas
router.put("/:id", isAdmin, citaController.updateEstadoCita); // PUT /api/citas/:id

module.exports = router;
