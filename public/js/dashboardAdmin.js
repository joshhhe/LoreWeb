// Las llamadas usan los endpoints esperados: /api/servicios, /api/productos, /api/citas
const btnCrearServicio = document.getElementById("newServiceBtn");
const btnCrearProducto = document.getElementById("newProductBtn");
const serviceForm = document.getElementById("serviceForm");
const productForm = document.getElementById("productForm");
const logOutBtn = document.getElementById("logoutBtn");

// Event listeners para cerrar modales
document.getElementById("closeServiceModal").addEventListener("click", () => {
  closeModal("serviceModal");
});

document.getElementById("cancelServiceModal").addEventListener("click", () => {
  closeModal("serviceModal");
});

document.getElementById("closeProductoModal").addEventListener("click", () => {
  closeModal("productoModal");
});

document.getElementById("cancelProductoModal").addEventListener("click", () => {
  closeModal("productoModal");
});

// Cerrar modales al hacer clic fuera
document.getElementById("serviceModal").addEventListener("click", (e) => {
  if (e.target.id === "serviceModal") {
    closeModal("serviceModal");
  }
});

document.getElementById("productoModal").addEventListener("click", (e) => {
  if (e.target.id === "productoModal") {
    closeModal("productoModal");
  }
});

btnCrearServicio.addEventListener("click", async () => {
  openModal("serviceModal");
});

btnCrearProducto.addEventListener("click", async () => {
  openModal("productoModal");
});

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("hidden");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("hidden");
}

serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Estado de carga
  Swal.fire({
    title: "Creando servicio...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const nombre = document.getElementById("nombre").value;
    const duracion_minutos = Number(document.getElementById("duracion").value);
    const precio = Number(document.getElementById("precio").value);

    const response = await fetch("/api/servicios", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        duracion_minutos,
        precio,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: "success",
        title: "¡Servicio creado!",
        text: data.message || "El servicio se agregó correctamente",
        confirmButtonColor: "#d97706",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-xl",
        },
      });
      cargarServicios();
      closeModal("serviceModal");
      serviceForm.reset();
    } else {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "Error al crear el servicio",
        confirmButtonColor: "#d97706",
        customClass: {
          popup: "rounded-xl",
          confirmButton: "rounded-lg",
        },
      });
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor. Verifica tu conexión.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
});

// Función para formatear precio a pesos chilenos
function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(precio);
}

//actualizar servicio
async function cargarServicios() {
  try {
    const service = await fetch("/api/servicios", {
      method: "GET",
      credentials: "include",
    });

    if (!service.ok) {
      throw new Error("Error al cargar servicios");
    }

    const data = await service.json();
    const tablaServicios = document.getElementById("servicesTbody");
    tablaServicios.innerHTML = "";

    data.services.forEach((servicio) => {
      const fila = document.createElement("tr");

      // Crear celdas de datos
      const celdaNombre = document.createElement("td");
      celdaNombre.className = "py-3";
      celdaNombre.textContent = servicio.nombre;

      const celdaDuracion = document.createElement("td");
      celdaDuracion.className = "py-3";
      celdaDuracion.textContent = `${servicio.duracion_minutos}min`;

      const celdaPrecio = document.createElement("td");
      celdaPrecio.className = "py-3";
      celdaPrecio.textContent = formatearPrecio(servicio.precio);

      fila.appendChild(celdaNombre);
      fila.appendChild(celdaDuracion);
      fila.appendChild(celdaPrecio);
      // Crear celda de acciones
      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "py-3";

      // Crear botón eliminar
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.className =
        "bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 ml-2";
      btnEliminar.addEventListener("click", () =>
        eliminarRegistro(servicio.id),
      );

      //crear boton actualizar
      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
      btnActualizar.className =
        "bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600";
      btnActualizar.addEventListener("click", () =>
        actualizarServicio(servicio.id),
      );

      // Agregar botón a la celda
      celdaAcciones.appendChild(btnActualizar);
      celdaAcciones.appendChild(btnEliminar);

      // Agregar celda a la fila
      fila.appendChild(celdaAcciones);

      // Agregar fila a la tabla
      tablaServicios.appendChild(fila);
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de carga",
      text: "No se pudieron cargar los servicios. Intenta recargar la página.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

//eliminar servicio
async function eliminarRegistro(id) {
  const result = await Swal.fire({
    title: "¿Eliminar servicio?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d97706",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg",
      cancelButton: "rounded-lg",
    },
  });

  if (!result.isConfirmed) return;

  // Estado de carga
  Swal.fire({
    title: "Eliminando...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/servicios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    await Swal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: data.message || "Servicio eliminado correctamente",
      confirmButtonColor: "#d97706",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
    });
    cargarServicios();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo eliminar el servicio. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

//actualizar servicio
async function actualizarServicio(id) {
  const { value: formValues } = await Swal.fire({
    title: "Actualizar Servicio",
    html:
      '<input id="swal-nombre" class="swal2-input" placeholder="Nombre del servicio">' +
      '<input id="swal-duracion" type="number" class="swal2-input" placeholder="Duración (minutos)">' +
      '<input id="swal-precio" type="number" class="swal2-input" placeholder="Precio">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#d97706",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Actualizar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg",
      cancelButton: "rounded-lg",
    },
    preConfirm: () => {
      const nombre = document.getElementById("swal-nombre").value;
      const duracion = document.getElementById("swal-duracion").value;
      const precio = document.getElementById("swal-precio").value;

      if (!nombre || !duracion || !precio) {
        Swal.showValidationMessage("Todos los campos son obligatorios");
        return false;
      }

      return {
        nombre: nombre,
        duracion_minutos: Number(duracion),
        precio: Number(precio),
      };
    },
  });

  if (!formValues) return;

  // Estado de carga
  Swal.fire({
    title: "Actualizando...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/servicios/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    await Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: data.message || "Servicio actualizado correctamente",
      confirmButtonColor: "#d97706",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
    });
    cargarServicios();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo actualizar el servicio. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

// Cargar citas
async function cargarCitas() {
  try {
    const response = await fetch("/api/citas", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al cargar citas");
    }

    const appointmentsList = document.getElementById("appointmentsList");
    appointmentsList.innerHTML = "";

    console.log("Citas recibidas:", data.citas);

    // Verificar si hay citas
    if (!data.citas || data.citas.length === 0) {
      appointmentsList.innerHTML = `
        <li class="py-4 text-center text-gray-500 text-sm">
          No hay citas registradas
        </li>
      `;
      return;
    }

    // Renderizar cada cita
    data.citas.forEach((cita) => {
      const citaElement = document.createElement("li");
      citaElement.className =
        "py-3 hover:bg-gray-50 px-3 rounded-lg transition";

      // Formatear fecha y hora
      const fecha = new Date(cita.fecha_cita).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Badge de estado
      let estadoBadge = "";
      let estadoColor = "";

      switch (cita.estado) {
        case "pendiente":
          estadoColor = "bg-yellow-100 text-yellow-700";
          estadoBadge = "Pendiente";
          break;
        case "confirmada":
          estadoColor = "bg-green-100 text-green-700";
          estadoBadge = "Confirmada";
          break;
        case "completada":
          estadoColor = "bg-blue-100 text-blue-700";
          estadoBadge = "Completada";
          break;
        case "cancelada":
          estadoColor = "bg-red-100 text-red-700";
          estadoBadge = "Cancelada";
          break;
        default:
          estadoColor = "bg-gray-100 text-gray-700";
          estadoBadge = cita.estado;
      }

      citaElement.innerHTML = `
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">Cita #${cita.id_cita}</p>
              <p class="text-sm text-gray-600 mt-1">
                <span class="inline-block">📅 ${fecha}</span>
                <span class="inline-block ml-3">⏰ ${cita.hora_cita}</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Usuario: ${cita.nombre_usuario} 
                Telefono: (${cita.telefono_usuario}) 
                Servicio: ${cita.nombre_servicio}
                Precio:($${cita.precio})
              </p>
            </div>
            <div class="ml-3">
              <span class="px-2 py-1 text-xs font-medium rounded-full ${estadoColor}">
                ${estadoBadge}
              </span>
            </div>
          </div>
          
          <!-- Botones de acción -->
          ${
            cita.estado === "pendiente"
              ? `
          <div class="flex gap-2">
            <button 
              class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
              data-cita-id="${cita.id_cita}"
              data-action="confirmar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Confirmar
            </button>
            <button 
              class="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
              data-cita-id="${cita.id_cita}"
              data-action="rechazar"
              
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Rechazar
            </button>
          </div>
          `
              : ""
          }
        </div>
      `;

      appointmentsList.appendChild(citaElement);
    });
  } catch (error) {
    const appointmentsList = document.getElementById("appointmentsList");
    appointmentsList.innerHTML = `
      <li class="py-4 text-center text-red-500 text-sm">
        Error al cargar citas: ${error.message}
      </li>
    `;
  }
}

//funcion para manejar acciones de citas y cambiar estado
async function updateCitas(idcita, nuevoEstado) {
  const response = await fetch(`/api/citas/${idcita}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  if (!response.ok) {
    console.error("Error al actualizar el estado de la cita");
    return;
  }
  const data = await response.json();
  //abrir whatsapp con mensaje segun estado
  if (nuevoEstado === "confirmada") {
    const telefono = data.data.telefono_usuario;
    const fecha = data.data.fecha_cita;
    const hora = data.data.hora_cita;
    const telefonoFormateado = formateoNumero(telefono);
    console.log(data);
    const mensaje = `Hola, su cita ha sido confirmada para el día ${fecha} a las ${hora},en Av. Pajaritos 3030, oficina 612, Para el servicio de ${data.data.nombre_servicio} ¡Gracias por elegirnos! Saludos de Ondina Braids`;
    const urlWhatsApp = `https://wa.me/56${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, "_blank");
    Swal.fire({
      icon: "success",
      title: "Cita confirmada",
      text: "La cita ha sido confirmada exitosamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  } else if (nuevoEstado === "cancelada") {
    const telefono = data.data.telefono_usuario;
    const fecha = data.data.fecha_cita;
    const hora = data.data.hora_cita;
    const telefonoFormateado = formateoNumero(telefono);
    console.log(data);
    const mensaje = `Hola, lamentamos informarle que su cita programada para el día ${fecha} a las ${hora} ha sido cancelada. Por favor, contáctenos para reprogramar. ¡Gracias por su comprensión!`;
    const urlWhatsApp = `https://wa.me/56${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, "_blank");
    Swal.fire({
      icon: "error",
      title: "Cita cancelada",
      text: "La cita ha sido cancelada exitosamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

//formateo de numero de telefono
function formateoNumero(numero) {
  // Eliminar TODO lo que NO sea número (espacios, guiones, paréntesis, +)
  let num = numero.replace(/\D/g, "");

  // Si empieza con 56, quitarlo
  if (num.startsWith("56")) {
    num = num.slice(2);
  }

  return num;
}
document.addEventListener("DOMContentLoaded", () => {
  cargarServicios();
  cargarProductos();
  cargarCitas();

  document
    .getElementById("appointmentsList")
    .addEventListener("click", async (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;
      const cidaId = button.getAttribute("data-cita-id");
      const action = button.getAttribute("data-action");
      if (action === "confirmar") {
        await updateCitas(cidaId, "confirmada");
        await cargarCitas();
      } else if (action === "rechazar") {
        await updateCitas(cidaId, "cancelada");
        await cargarCitas();
      }
    });
});

//Haremos el fetch para la parte de productos

//Post para crear productos
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreProducto").value;
  const precio = Number(document.getElementById("precioProducto").value);
  const descripcion = document.getElementById("descripcionProducto").value;
  const stock = Number(document.getElementById("stockProducto").value);

  if (!precio || !stock) {
    await Swal.fire({
      icon: "warning",
      title: "Datos inválidos",
      text: "Precio y stock deben ser números válidos",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
    return;
  }
  if (precio < 0 || stock < 0) {
    await Swal.fire({
      icon: "warning",
      title: "Valores negativos",
      text: "Precio y stock no pueden ser negativos",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
    return;
  }
  if (descripcion.trim() === "" || nombre.trim() === "") {
    await Swal.fire({
      icon: "warning",
      title: "Campos vacíos",
      text: "Nombre y descripción no pueden estar vacíos",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
    return;
  }

  // Estado de carga
  Swal.fire({
    title: "Creando producto...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch("/api/productos", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        precio,
        descripcion,
        stock,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    await Swal.fire({
      icon: "success",
      title: "¡Producto creado!",
      text: data.message || "El producto se agregó correctamente",
      confirmButtonColor: "#d97706",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
    });
    cargarProductos();
    closeModal("productoModal");
    productForm.reset();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo crear el producto. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
});

//Eliminar producto
async function eliminarProducto(id) {
  const result = await Swal.fire({
    title: "¿Eliminar producto?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d97706",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg",
      cancelButton: "rounded-lg",
    },
  });

  if (!result.isConfirmed) return;

  // Estado de carga
  Swal.fire({
    title: "Eliminando...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    await Swal.fire({
      icon: "success",
      title: "¡Eliminado!",
      text: data.message || "Producto eliminado correctamente",
      confirmButtonColor: "#d97706",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
    });
    cargarProductos();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo eliminar el producto. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

//PUT para actualizar productos
async function actualizarProducto(id) {
  const { value: formValues } = await Swal.fire({
    title: "Actualizar Producto",
    html:
      '<input id="swal-nombre-prod" class="swal2-input" placeholder="Nombre del producto">' +
      '<input id="swal-precio-prod" type="number" class="swal2-input" placeholder="Precio">' +
      '<input id="swal-descripcion-prod" class="swal2-input" placeholder="Descripción">' +
      '<input id="swal-stock-prod" type="number" class="swal2-input" placeholder="Stock">',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#d97706",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Actualizar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg",
      cancelButton: "rounded-lg",
    },
    preConfirm: () => {
      const nombre = document.getElementById("swal-nombre-prod").value;
      const precio = document.getElementById("swal-precio-prod").value;
      const descripcion = document.getElementById(
        "swal-descripcion-prod",
      ).value;
      const stock = document.getElementById("swal-stock-prod").value;

      if (!nombre || !precio || !descripcion || !stock) {
        Swal.showValidationMessage("Todos los campos son obligatorios");
        return false;
      }

      return {
        nombre: nombre,
        precio: Number(precio),
        descripcion: descripcion,
        stock: Number(stock),
      };
    },
  });

  if (!formValues) return;

  // Estado de carga
  Swal.fire({
    title: "Actualizando...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch(`/api/productos/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    await Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: data.message || "Producto actualizado correctamente",
      confirmButtonColor: "#d97706",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
    });
    cargarProductos();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo actualizar el producto. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

//funcion para cargar productos
async function cargarProductos() {
  try {
    const productos = await fetch("/api/productos", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!productos.ok) {
      throw new Error("Error al cargar productos");
    }

    const data = await productos.json();
    const tablaProductos = document.getElementById("productsTbody");
    tablaProductos.innerHTML = "";

    data.productos.forEach((producto) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      celdaNombre.className = "py-3";
      celdaNombre.textContent = producto.nombre;

      const celdaStock = document.createElement("td");
      celdaStock.className = "py-3";
      celdaStock.textContent = producto.stock;

      const celdaDescripcion = document.createElement("td");
      celdaDescripcion.className = "py-3";
      celdaDescripcion.textContent = producto.descripcion;

      const celdaPrecio = document.createElement("td");
      celdaPrecio.className = "py-3";
      celdaPrecio.textContent = formatearPrecio(producto.precio);

      const celdaCategoria = document.createElement("td");
      celdaCategoria.className = "py-3";
      celdaCategoria.textContent = producto.categoria;

      fila.appendChild(celdaNombre);
      fila.appendChild(celdaStock);
      fila.appendChild(celdaDescripcion);
      fila.appendChild(celdaPrecio);
      fila.appendChild(celdaCategoria);

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "py-3";

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.className =
        "bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 ml-2";
      btnEliminar.addEventListener("click", () =>
        eliminarProducto(producto.id),
      );

      const btnActualizar = document.createElement("button");
      btnActualizar.textContent = "Actualizar";
      btnActualizar.className =
        "bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600";
      btnActualizar.addEventListener("click", () =>
        actualizarProducto(producto.id),
      );

      celdaAcciones.appendChild(btnActualizar);
      celdaAcciones.appendChild(btnEliminar);

      fila.appendChild(celdaAcciones);

      tablaProductos.appendChild(fila);
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Error de carga",
      text: "No se pudieron cargar los productos. Intenta recargar la página.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
}

logOutBtn.addEventListener("click", () => {
  fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  }).then(() => {
    window.location.href = "/login";
  });
});
