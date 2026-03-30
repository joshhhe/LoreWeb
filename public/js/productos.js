const todosLosProductos = document.querySelectorAll(".producto");
const btnTodosProductos = document.getElementById("todosProductos");
const btnGelesFijadores = document.getElementById("btn-geles-fijadores");
const btnAceitesTratamientos = document.getElementById(
  "btn-aceites-tratamientos",
);
const nombreProducto = "";
const precioProducto = 0;
const cantidadProducto = 0;
const cart = [];

const cartCountEl = document.getElementById("cant-items");
// Selecciona botones que tengan `data-name` y `data-price`, o los que ya usan el id prefijo
const btnAgregarCarrito = document.querySelectorAll(
  'button[data-name][data-price], button[id^="add-to-cart-"]',
);

btnAgregarCarrito.forEach((btn) => {
  btn.addEventListener("click", () => {
    let id = btn.id;
    const nombre = btn.dataset.name;
    const precio = btn.dataset.price;

    // Generar un id estable si no existe (evita claves `undefined` en localStorage)
    if (!id) {
      id = `add-to-cart-${String(nombre || "producto")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_.]/g, "")}`;
      btn.id = id;
    }

    const card = btn.closest(".producto");
    const imagen = card ? card.querySelector("img")?.getAttribute("src") : null;

    const currentCount = parseInt(cartCountEl.textContent || "0", 10);
    cartCountEl.textContent = String(currentCount + 1);

    guardarEnCarrito({ id, nombre, precio, cantidad: 1, imagen });
    leerCarrito(id);
  });
});

function guardarEnCarrito(producto) {
  const key = producto.id || producto.nombre;
  const stored = JSON.parse(localStorage.getItem(key));

  if (stored && stored.id === producto.id) {
    const updated = {
      ...stored,
      cantidad: (Number(stored.cantidad) || 0) + 1,
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return;
  }

  const item = {
    id: producto.id || key,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen: producto.imagen,
    cantidad: Number(producto.cantidad) || 1,
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function leerCarrito(id) {
  const cartItemsEl = JSON.parse(localStorage.getItem(`${id}`)) || [];
  console.log(cartItemsEl);
  cart.push(cartItemsEl);
  console.log(cart);
}

const btnAcesorios = document.getElementById("btn-acesorios");

btnGelesFijadores.addEventListener("click", () => {
  renderProductos("geles-fijadores");
});

btnAcesorios.addEventListener("click", () => {
  renderProductos("accesorios");
});

btnAceitesTratamientos.addEventListener("click", () => {
  renderProductos("aceites-tratamientos");
});

btnTodosProductos.addEventListener("click", () => {
  todosLosProductos.forEach((producto) => {
    producto.classList.remove("hidden");
  });
});

//funcion para renderizar productos segun categoria
function renderProductos(categoria) {
  const arrayProductos = Array.from(todosLosProductos);

  // Ocultar todos los productos primero
  arrayProductos.forEach((producto) => {
    producto.classList.add("hidden");
  });

  // Mostrar solo los productos filtrados
  const productosFiltrados = arrayProductos.filter((producto) => {
    return producto.dataset.category === categoria;
  });

  productosFiltrados.forEach((producto) => {
    producto.classList.remove("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  todosLosProductos.forEach((producto) => {
    producto.classList.remove("hidden");
  });
});
