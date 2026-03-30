const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const rateLimiter = require("express-rate-limit");

const loginLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 4,
  keyGenerator: (req) => {
    return `${req.body.email || "unknown"}_${req.ip}`;
  },
  message: {
    success: false,
    message:
      "Demasiados intentos de login. Por favor intenta de nuevo más tarde.",
  },
});

const registroLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5,
  message: {
    success: false,
    message:
      "Demasiados intentos de registro. Por favor intenta de nuevo más tarde.",
  },
});
// 5️⃣ Ruta POST para login
// URL completa: http://localhost:3000/auth/login
router.post("/login", loginLimiter, authController.Login);

// 8️⃣ Ruta POST para registro
// URL completa: http://localhost:3000/auth/registro
router.post("/registro", registroLimiter, authController.Registro);
// Ruta para obtener datos de sesión actual
router.get("/sesion", (req, res) => {
  console.log("🔍 Verificando sesión en backend...");
  console.log("📦 req.session:", req.session);
  console.log("🔑 req.session.userId:", req.session.userId);

  if (req.session.userId) {
    console.log("✅ Sesión encontrada");
    res.status(200).json({
      success: true,
      autenticado: true,
      usuario: {
        id: req.session.userId,
        nombre: req.session.nombre,
        email: req.session.email,
        rol: req.session.rol,
        telefono: req.session.telefono,
      },
    });
  } else {
    console.log("❌ No hay sesión activa");
    res.status(200).json({
      success: true,
      autenticado: false,
      usuario: null,
    });
  }
});

// 6️⃣ Ruta POST para logout
// URL completa: http://localhost:3000/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error al destruir sesión:", err);
      return res.status(500).json({
        success: false,
        message: "Error al cerrar sesión",
      });
    }
    res.clearCookie("connect.sid"); // Limpiar la cookie
    res.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  });
});

module.exports = router;
