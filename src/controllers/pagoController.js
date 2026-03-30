const { MercadoPagoConfig, Preference } = require("mercadopago");
const pagoModel = require("../models/pagoModel");

const createOrder = async (req, res) => {
  const {
    id_usuario,
    total,
    nombre,
    direccion,
    rut,
    telefono,
    metodo_envio,
    shipping_cost,
    ciudad,
    comuna,
    postal,
    items,
  } = req.body;

  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return res.status(500).json({
        message: "Falta MERCADO_PAGO_ACCESS_TOKEN en el entorno",
      });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
    const preference = new Preference(client);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Debe enviar al menos un item",
      });
    }

    const cabezera = {
      id_usuario: id_usuario || null,
      total: Number(total) || 0,
      estado: "pendiente",
      nombre: nombre,
      direccion: direccion,
      rut: rut,
      telefono: telefono,
      metodo_envio: metodo_envio,
      shipping_cost: Number(shipping_cost) || 0,
      ciudad: ciudad,
      comuna: comuna,
      postal: postal,
    };

    const response = await pagoModel.createOrden(cabezera);
    const ordenId = response?.id_orden || response?.id;

    if (!ordenId) {
      return res.status(500).json({
        message: "No se pudo obtener el id de la orden",
      });
    }

    const result = await preference.create({
      body: {
        items,
        external_reference: String(ordenId),
        back_urls: {
          success:
            "https://proportioned-unantagonised-rhona.ngrok-free.dev/productos?status=success",
          failure:
            "https://proportioned-unantagonised-rhona.ngrok-free.dev/productos?status=failure",
          pending:
            "https://proportioned-unantagonised-rhona.ngrok-free.dev/productos?status=pending",
        },
        notification_url:
          "https://proportioned-unantagonised-rhona.ngrok-free.dev/api/pagos/webhook",
      },
    });

    if (ordenId) {
      for (const item of items) {
        await pagoModel.createOrdenDetalles({
          id_orden: ordenId,
          id_producto: null,
          cantidad: item.quantity,
          precio: item.unit_price,
          nombre_producto: item.title,
          subtotal: item.unit_price * item.quantity,
        });
      }
    }

    if (response) {
      res.status(201).json({
        success: true,
        message: "Orden creada exitosamente",
        result,
      });
    }
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({
      message: "Error creando preferencia",
      error: error?.message || error,
    });
  }
};

const webhook = async (req, res) => {
  console.log("Webhook Mercado Pago recibido:");
  console.log(req.query);
  console.log(req.body);
  const paymentId = req.query["data.id"] || req.body?.data?.id;
  if (paymentId) {
    const pago = await consultarPago(paymentId);
    const idOrden = pago?.external_reference
      ? Number(pago.external_reference)
      : null;
    const estadoMap = {
      approved: "pagado",
      pending: "pendiente",
      rejected: "cancelado",
    };
    const nuevoEstado = pago?.status ? estadoMap[pago.status] : null;
    if (idOrden && nuevoEstado) {
      const response = await pagoModel.updateOrdenEstado(idOrden, nuevoEstado);
      console.log("Orden actualizada:", response);
    }
  }
  //  guardaenbasedeDatos();

  res.send("Webhook recibido");
};

async function consultarPago(paymentId) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error consultando pago:", res.status, errorText);
    return;
  }

  const data = await res.json();

  console.log({
    id: data.id,
    status: data.status,
    status_detail: data.status_detail,
    payment_method_id: data.payment_method_id,
    transaction_amount: data.transaction_amount,
  });

  return data;
}

module.exports = {
  createOrder,
  webhook,
};
