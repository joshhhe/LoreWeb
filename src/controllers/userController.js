const User = require("../models/userModel");

// Controlador de Usuarios
const userController = {
  // Obtener todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener usuarios", details: error.message });
    }
  },

  // Obtener usuario por ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.getById(id);

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json(user);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al obtener usuario", details: error.message });
    }
  },

  // Crear nuevo usuario
  createUser: async (req, res) => {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al crear usuario", details: error.message });
    }
  },

  // Actualizar usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUser = await User.update(id, req.body);

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al actualizar usuario", details: error.message });
    }
  },

  // Eliminar usuario
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await User.delete(id);
      res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al eliminar usuario", details: error.message });
    }
  },
};

module.exports = userController;
