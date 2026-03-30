const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pagoController");

// Crear preferencia de pago
// POST /api/pagos/createOrder
router.post("/createOrder", pagoController.createOrder);

// Webhook Mercado Pago
// POST /api/pagos/webhook
router.post("/webhook", pagoController.webhook);

router.get("/success", (req, res) => {
  res.send("Pago exitoso. Gracias por tu compra.");
});

router.get("/failure", (req, res) => {
  res.send("Pago fallido. Por favor, intenta nuevamente.");
});

router.get("/pending", (req, res) => {
  res.send("Pago pendiente. Estamos procesando tu pedido.");
});

module.exports = router;
