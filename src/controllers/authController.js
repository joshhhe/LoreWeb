const hash = require("bcrypt");
const AuthModel = require("../models/authModel");
// Controlador de Autenticación

const authController = {
  //verificar si existe usuario para login
  Login: async (req, res) => {
    let { email, password } = req.body || {};
    email = (email || "").trim().toLowerCase();
    password = password || "";
    try {
      const usuario = await AuthModel.findUserByEmail(email);

      if (!usuario) {
        res.status(404).json({
          success: false,
          message: "Email o contraseña incorrectos",
        });
        return;
      } else {
        const validarPassword = await hash.compare(
          password,
          usuario.password_hash,
        );
        if (!validarPassword) {
          res.status(401).json({
            success: false,
            message: "Contraseña incorrecta",
          });
          return;
        }

        //genera nuevo ID para evitar session fixation
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error al crear nueva sesión",
            });
          }

          // ✅ Guardar datos en la sesión NUEVA (dentro del callback)
          req.session.userId = usuario.id;
          req.session.nombre = usuario.nombre;
          req.session.rol = usuario.rol;
          req.session.email = usuario.email;
          req.session.telefono = usuario.telefono;

          let redirect = usuario.rol === "admin" ? "/admin/dashboard" : "/";

          // Guardar la sesión explícitamente antes de responder
          req.session.save((err) => {
            if (err) {
              console.error("❌ Error guardando sesión:", err);
              return res.status(500).json({
                success: false,
                message: "Error al guardar la sesión",
              });
            }

            // ✅ Responder al cliente DESPUÉS de guardar
            res.status(200).json({
              success: true,
              message: "Login exitoso",
              redirect: redirect,
              user: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                telefono: usuario.telefono,
              },
            });
          });
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error en el login", details: error.message });
    }
  },

  // Registro de nuevo usuario
  Registro: async (req, res) => {
    let { nombre, email, password, telefono } = req.body || {};
    nombre = (nombre || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";
    telefono = telefono || null;
    try {
      // Validación server-side y normalización
      const errors = [];
      if (!nombre || nombre.length < 2)
        errors.push("Nombre inválido (mínimo 2 caracteres)");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) errors.push("Email inválido");
      const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // al menos 8 chars, letras y números
      if (!password || !passRegex.test(password))
        errors.push(
          "La contraseña debe tener al menos 8 caracteres e incluir letras y números",
        );
      if (telefono && !/^\+?\d{10,15}$/.test(telefono))
        errors.push("Teléfono inválido");

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      // Verificar si el email ya existe (consulta parametrizada en el modelo)
      const usuarioExistente = await AuthModel.findUserByEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({
          success: false,
          message: "Este email ya está registrado",
        });
      }

      // Hashear contraseña (bcrypt rounds configurable si se desea)
      const hashedPassword = await hash.hash(password, 10);

      // Crear usuario en BD (siempre como 'cliente')
      const nuevoUsuario = await AuthModel.createUser(
        nombre,
        email,
        hashedPassword,
        telefono || null,
        "cliente", // Por defecto todos los registros son clientes
      );

      res.status(201).json({
        success: true,
        message: "Cuenta creada exitosamente",
        user: {
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol,
        },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({
        success: false,
        message: "Error interno al crear la cuenta",
      });
    }
  },
};

module.exports = authController;
