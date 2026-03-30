const cartContenedor = document.getElementById("order-items");
const nombreUsuario = document.getElementById("full-name");
const direccionUsuario = document.getElementById("shipping-address");
const rutUsuario = document.getElementById("rut");
const telefonoUsuario = document.getElementById("telefono");
const ciudadUsuario = document.getElementById("shipping-city");
const comunaUsuario = document.getElementById("shipping-comuna");
const postalUsuario = document.getElementById("shipping-zip");
const subtotal = document.getElementById("subtotal");
const shippingCost = document.getElementById("shipping");
const total = document.getElementById("total");
const clearCartBtn = document.getElementById("clear-cart");
const shippingInputs = document.querySelectorAll(
  'input[name="shipping-method"]',
);
const btnCheckOut = document.getElementById("checkout-btn");

let currentUserId = null;

const itemsCarrito = localStorage;
const carrito = [];

function getItemsCarrito(storage) {
  carrito.length = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const raw = storage.getItem(key);
    if (!raw) continue;
    let item;
    try {
      item = JSON.parse(raw);
    } catch (error) {
      continue;
    }

    if (
      !item ||
      typeof item !== "object" ||
      typeof item.nombre !== "string" ||
      typeof item.precio === "undefined" ||
      typeof item.cantidad === "undefined"
    ) {
      continue;
    }

    const precio = Number(item.precio) || 0;
    const cantidad = Number(item.cantidad) || 0;

    if (precio <= 0 || cantidad <= 0) continue;

    carrito.push({
      ...item,
      precio,
      cantidad,
    });
  }
  return carrito;
}

function renderCarrito() {
  if (!cartContenedor) return;
  cartContenedor.innerHTML = "";

  if (!carrito.length) {
    cartContenedor.innerHTML =
      '<p class="text-xs text-gray-500">Tu carrito está vacío.</p>';
    toggleCheckout(false);
    return;
  }

  toggleCheckout(true);

  carrito.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.classList.add("flex", "items-center", "gap-3");
    const imageSrc = item.imagen || "https://via.placeholder.com/64";
    itemEl.innerHTML = `
      <img src="${imageSrc}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded">
      <div class="min-w-0">
        <h3 class="text-sm font-medium truncate">${item.nombre}</h3>
        <p class="text-sm text-gray-500">${formatCLP(item.precio)}</p>
        <p class="text-sm text-gray-500">Cantidad: ${item.cantidad}</p>
      </div>
    `;
    cartContenedor.appendChild(itemEl);
  });
}

function toggleCheckout(enabled) {
  if (!btnCheckOut) return;
  btnCheckOut.disabled = !enabled;
  btnCheckOut.classList.toggle("opacity-50", !enabled);
  btnCheckOut.classList.toggle("cursor-not-allowed", !enabled);
}

function getShippingValue() {
  const selected = Array.from(shippingInputs).find((input) => input.checked);
  if (!selected) return 0;

  if (selected.value === "express") return 9990;
  if (selected.value === "pickup") return 0;

  return 4990;
}

function actualizarTotales() {
  const subTotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  const envio = getShippingValue();

  if (subtotal) subtotal.textContent = formatCLP(subTotal);
  if (shippingCost) shippingCost.textContent = formatCLP(envio);
  if (total) total.textContent = formatCLP(subTotal + envio);
}

function clearCartItems() {
  const keysToRemove = [];
  for (let i = 0; i < itemsCarrito.length; i++) {
    const key = itemsCarrito.key(i);
    const raw = itemsCarrito.getItem(key);
    if (!raw) continue;
    let item;
    try {
      item = JSON.parse(raw);
    } catch (error) {
      continue;
    }

    if (
      item &&
      typeof item === "object" &&
      typeof item.nombre === "string" &&
      typeof item.precio !== "undefined" &&
      typeof item.cantidad !== "undefined"
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => itemsCarrito.removeItem(key));
  getItemsCarrito(itemsCarrito);
  renderCarrito();
  actualizarTotales();
}

getItemsCarrito(itemsCarrito);
renderCarrito();
actualizarTotales();

async function loadSessionUser() {
  try {
    const response = await fetch("/auth/sesion", {
      credentials: "include",
    });
    const data = await response.json();
    if (data?.autenticado && data?.usuario?.id) {
      currentUserId = data.usuario.id;
      console.log("Usuario autenticado con ID:", data);
    }
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSessionUser();
});

shippingInputs.forEach((input) => {
  input.addEventListener("change", actualizarTotales);
});

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", clearCartItems);
}

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

btnCheckOut.addEventListener("click", async () => {
  const banderaCarrito = validarCarrito();
  if (!banderaCarrito) return;
  const bandera = validateCheckout();
  if (bandera) {
    btnCheckOut.disabled = true;
    try {
      const shippingMethod =
        Array.from(shippingInputs).find((input) => input.checked)?.value ||
        "standard";
      const shippingValue = getShippingValue();
      const totalValue = carrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0,
      );

      const response = await fetch("/api/pagos/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: currentUserId,
          nombre: nombreUsuario.value.trim(),
          direccion: direccionUsuario.value.trim(),
          rut: rutUsuario.value.trim(),
          telefono: telefonoUsuario.value.trim(),
          ciudad: ciudadUsuario.value.trim(),
          comuna: comunaUsuario.value.trim(),
          postal: postalUsuario.value.trim(),
          metodo_envio: shippingMethod,
          shipping_cost: shippingValue,
          total: totalValue + shippingValue,
          items: carrito.map((item) => ({
            title: item.nombre,
            unit_price: item.precio,
            quantity: item.cantidad,
            currency_id: "CLP",
          })),
        }),
      });
      const data = await response.json();
      console.log("Respuesta backend:", data);
      if (response.ok) {
        //window.location.href = data.result.init_point;
      }
    } catch (error) {
      btnCheckOut.disabled = false;
      console.error("Error en createOrder:", error);
    }
  }
});

function cleanInputs() {
  nombreUsuario.value = "";
  direccionUsuario.value = "";
  rutUsuario.value = "";
  telefonoUsuario.value = "";
  ciudadUsuario.value = "";
  comunaUsuario.value = "";
  postalUsuario.value = "";
}

function validateCheckout() {
  const nombre = nombreUsuario.value.trim();
  const direccion = direccionUsuario.value.trim();
  const rut = rutUsuario.value.trim();
  const telefono = telefonoUsuario.value.trim();
  const ciudad = ciudadUsuario.value.trim();
  const comuna = comunaUsuario.value.trim();

  const invalidInputs = [];
  if (!validarNombre(nombre)) invalidInputs.push(nombreUsuario);
  if (!validarDireccion(direccion)) invalidInputs.push(direccionUsuario);
  if (!validarRut(rut)) invalidInputs.push(rutUsuario);
  if (!validarTelefono(telefono)) invalidInputs.push(telefonoUsuario);
  if (!validarCiudad(ciudad)) invalidInputs.push(ciudadUsuario);
  if (!validarComuna(comuna)) invalidInputs.push(comunaUsuario);

  if (invalidInputs.length) {
    mostrarError(invalidInputs);
    return false;
  }

  return true;
}

function validarNombre(nombre) {
  if (nombre === "" || nombre.length < 3) {
    return false;
  }
  return true;
}

function validarDireccion(direccion) {
  if (direccion === "" || direccion.length < 5) {
    return false;
  }
  return true;
}

function validarCiudad(ciudad) {
  if (ciudad === "" || ciudad.length < 3) {
    return false;
  }
  return true;
}

function validarRut(rut) {
  if (rut === "" || rut.length < 8) {
    return false;
  }

  const rutPattern = /^[0-9.\-kK]+$/;
  if (!rutPattern.test(rut)) {
    return false;
  }
  return true;
}

function validarTelefono(telefono) {
  const digits = telefono.replace(/\D/g, "");
  if (digits.length < 8) {
    return false;
  }
  return true;
}

function validarComuna(comuna) {
  if (comuna === "" || comuna.length < 3) {
    return false;
  }

  const onlyLetters = /^[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+$/;
  if (!onlyLetters.test(comuna)) {
    return false;
  }

  return true;
}

function validarCarrito() {
  if (!carrito.length) {
    return false;
  }
  return true;
}

function mostrarError(inputs) {
  inputs.forEach((input) => {
    if (!input) return;
    input.classList.add("border-red-500");
    input.classList.add("ring-1", "ring-red-300");
    input.classList.add("border-2", "border-solid");

    setTimeout(() => {
      input.classList.remove("border-red-500");
      input.classList.remove("ring-1", "ring-red-300");
      input.classList.remove("border-2", "border-solid");
    }, 8000);
  });
}
