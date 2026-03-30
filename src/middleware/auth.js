// Middleware para proteger rutas que requieren autenticación

// Verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Usuario autenticado, continuar
    next();
  } else {
    // No autenticado, redirigir al login
    res.redirect("/login");
  }
};

// Verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.rol === "admin") {
    // Es admin, continuar
    next();
  } else {
    // No es admin, redirigir al home
    res.redirect("/");
  }
};

module.exports = { isAuthenticated, isAdmin };
