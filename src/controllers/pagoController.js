const { MercadoPagoConfig, Preference } = require("mercadopago");
const crypto = require("crypto");
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
          success: "https://loreweb.onrender.com/productos?status=success",
          failure: "https://loreweb.onrender.com/productos?status=failure",
          pending: "https://loreweb.onrender.com/productos?status=pending",
        },
        notification_url: "https://loreweb.onrender.com/api/pagos/webhook",
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

function parseXSignature(signatureHeader) {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    return {};
  }

  return signatureHeader
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
}

function safeCompareHex(expected, received) {
  if (!expected || !received) return false;

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    return false;
  }
}

function isFreshTimestamp(ts) {
  const tsNumber = Number(ts);
  if (!Number.isFinite(tsNumber) || tsNumber <= 0) return false;

  // Mercado Pago envía timestamp en segundos en x-signature
  const tsMs = tsNumber * 1000;
  const maxSkewMs = 5 * 60 * 1000;

  return Math.abs(Date.now() - tsMs) <= maxSkewMs;
}

function verificarFirmaWebhookMercadoPago(req, paymentId) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MERCADO_PAGO_WEBHOOK_SECRET no está configurado");
    return false;
  }

  const signatureHeader = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];

  if (!signatureHeader || !requestId) {
    return false;
  }

  const parsedSignature = parseXSignature(signatureHeader);
  const ts = parsedSignature.ts;
  const v1 = parsedSignature.v1;

  if (!ts || !v1) {
    return false;
  }

  if (!isFreshTimestamp(ts)) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const generatedV1 = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return safeCompareHex(generatedV1, v1);
}

const webhook = async (req, res) => {
  try {
    console.log("Webhook Mercado Pago recibido:");
    console.log(req.query);
    console.log(req.body);

    const paymentId = req.query["data.id"] || req.body?.data?.id;
    if (!paymentId) {
      return res.status(200).send("Webhook recibido sin paymentId");
    }

    const firmaValida = verificarFirmaWebhookMercadoPago(
      req,
      String(paymentId),
    );

    if (!firmaValida) {
      return res.status(401).json({
        success: false,
        message: "Firma de webhook inválida",
      });
    }

    const pago = await consultarPago(paymentId);
    if (!pago) {
      return res.status(200).send("Webhook recibido, pago no disponible");
    }

    const idOrden = pago?.external_reference
      ? Number(pago.external_reference)
      : null;

    const estadoMap = {
      approved: "pagado",
      pending: "pendiente",
      rejected: "cancelado",
    };

    const nuevoEstado = pago?.status ? estadoMap[pago.status] : null;

    if (!idOrden || !nuevoEstado) {
      return res
        .status(200)
        .send("Webhook recibido, sin datos para actualizar");
    }

    const ordenActual = await pagoModel.getOrdenById(idOrden);

    if (!ordenActual) {
      return res.status(200).send("Webhook recibido, orden no encontrada");
    }

    // Idempotencia: si ya está en el mismo estado, no reprocesar
    if (ordenActual.estado === nuevoEstado) {
      console.log(
        `Webhook duplicado ignorado para orden ${idOrden} (estado: ${nuevoEstado})`,
      );
      return res.status(200).send("Webhook duplicado, sin cambios");
    }

    // Evitar degradar el estado cuando ya está pagado
    if (ordenActual.estado === "pagado" && nuevoEstado !== "pagado") {
      console.log(
        `Transición ignorada para orden ${idOrden}: ${ordenActual.estado} -> ${nuevoEstado}`,
      );
      return res.status(200).send("Webhook recibido, transición ignorada");
    }

    const response = await pagoModel.updateOrdenEstado(idOrden, nuevoEstado);
    console.log("Orden actualizada:", response);

    return res.status(200).send("Webhook procesado");
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Error procesando webhook",
      error: error?.message || error,
    });
  }
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
