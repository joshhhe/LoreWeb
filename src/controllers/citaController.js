const { success } = require("zod");
const citasModel = require("../models/citaModel");

let HoraNow = new Date();
console.log("HoraNow en citaController:", HoraNow);
let diaNow = HoraNow.getDate();
console.log("diaNow en citaController:", diaNow);
const citaController = {
  // Verificar disponibilidad de citas
  verificarCitaDisponible: async (req, res) => {
    try {
      const { fecha_cita, hora_cita } = req.body;
      const count = await citasModel.verificarCitasDisponibles(
        fecha_cita,
        hora_cita,
      );
      if (count === 0) {
        res.status(200).json({
          success: true,
          message: "Cita disponible",
        });
      } else {
        res.status(409).json({
          success: false,
          message: "Cita no disponible",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al verificar la disponibilidad de la cita",
      });
    }
  },

  getAllCitas: async (req, res) => {
    try {
      const citas = await citasModel.getAllCitas();
      if (citas.length > 0) {
        res.status(200).json({
          success: true,
          citas: citas,
          message: "Citas obtenidas correctamente",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No se encontraron citas",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener Citas",
      });
    }
  },

  //getCitaById: async (req, res) => {},

  createCita: async (req, res) => {
    try {
      const { id_usuario, id_servicio, fecha_cita, hora_cita, estado } =
        req.body;

      // 1️⃣ PRIMERO: Validar campos requeridos
      if (!id_usuario || !id_servicio || !fecha_cita || !hora_cita) {
        return res.status(400).json({
          success: false,
          message:
            "Todos los campos son requeridos (id_usuario, id_servicio, fecha_cita, hora_cita)",
        });
      }

      // 2️⃣ SEGUNDO: Validar que la fecha no sea pasada
      const fechaCita = new Date(fecha_cita);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaCita < hoy) {
        return res.status(400).json({
          success: false,
          message: "La fecha de la cita no puede ser en el pasado",
        });
      }

      // 3️⃣ TERCERO: Validar disponibilidad de horario
      const count = await citasModel.verificarCitasDisponibles(
        fecha_cita,
        hora_cita,
      );

      if (count > 0) {
        return res.status(409).json({
          success: false,
          message: "horario de cita ya tomado",
        });
      }

      // 4️⃣ CUARTO: Crear la cita
      const nuevaCita = await citasModel.createCita({
        id_usuario,
        id_servicio,
        fecha_cita,
        hora_cita,
        estado: estado || "pendiente", // Por defecto 'pendiente'
      });

      res.status(201).json({
        success: true,
        message: "Cita creada exitosamente",
        data: nuevaCita,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear la cita",
        error: error.message,
      });
    }
  },

  updateEstadoCita: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const newEstadoCita = await citasModel.updateEstadoCitas(id, estado);

      if (newEstadoCita) {
        res.status(200).json({
          success: true,
          message: "Estado de cita actualizado correctamente",
          data: newEstadoCita,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Cita no encontrada",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el estado de la cita",
        error: error.message,
      });
    }
  },
};

module.exports = citaController;
