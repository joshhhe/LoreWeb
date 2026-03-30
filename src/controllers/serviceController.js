const { success } = require("zod");
const ServiceModel = require("../models/serviceModel");

const serviceController = {
  createService: async (req, res) => {
    try {
      const { nombre, descripcion, duracion_minutos, precio } = req.body;
      if (!nombre || !duracion_minutos || !precio) {
        return res
          .status(400)
          .json({ success: false, message: "Faltan campos obligatorios" });
      }

      const serviceData = {
        nombre,
        descripcion: descripcion || "",
        duracion_minutos,
        precio,
      };

      const result = await ServiceModel.createService(serviceData);

      if (result) {
        res.status(201).json({
          success: true,
          message: "Servicio creado exitosamente",
          service: {
            id: result.id,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error creating service" });
    }
  },

  getAllServices: async (req, res) => {
    try {
      const services = await ServiceModel.getAllServices();

      if (services.length > 0) {
        res.status(200).json({
          success: true,
          message: "Servicios obtenidos exitosamente",
          services: services,
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "No hay servicios disponibles" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener servicios" });
    }
  },

  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await ServiceModel.deleteService(id);
      if (result) {
        res.status(200).json({
          success: true,
          message: "Servicio eliminado exitosamente",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Servicio no encontrado",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error in service service" });
    }
  },

  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const serviceData = req.body;
      const result = await ServiceModel.updateService(id, serviceData);
      if (result) {
        res.status(200).json({
          success: true,
          message: "Servicio actualizado correctamente",
          result,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "El Servicio no fue actualizado",
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el servicio" });
    }
  },
};

module.exports = serviceController;
