const citaForm = document.getElementById("citaForm");
let datosSesion = null;
/**
 * Verifica la sesión en el backend y retorna los datos de sesión si existen.
 * Devuelve el objeto { autenticado, usuario } o null/undefined si no hay sesión.
 */
async function verificarSesion() {
  try {
    const response = await fetch("/auth/sesion", {
      method: "GET",
      credentials: "include", // Importante: incluir cookies
    });
    const data = await response.json();
    // Elementos del navbar
    const userProfileNav = document.getElementById("userProfileNav");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const loginBtnNav = document.getElementById("loginBtnNav");
    const logoutBtn = document.getElementById("logoutBtn");

    if (data.autenticado) {
      console.log("✅ USUARIO AUTENTICADO:");
      console.log("📧 Email:", data.usuario.email);
      console.log("👤 Nombre:", data.usuario.nombre);
      console.log("🔑 ID:", data.usuario.id);
      console.log("👔 Rol:", data.usuario.rol);
      console.log("📦 Datos completos:", data.usuario);
      console.log("📦 Respuesta completa del servidor:", data);

      // Mostrar nombre del usuario en el navbar
      if (userNameDisplay && userProfileNav) {
        userNameDisplay.textContent = data.usuario.nombre;
        userProfileNav.classList.remove("hidden");
        userProfileNav.classList.add("flex");
      }

      // Ocultar botón de login
      if (loginBtnNav) {
        loginBtnNav.classList.add("hidden");
      }

      // Configurar botón de logout
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          try {
            const response = await fetch("/auth/logout", {
              method: "POST",
              credentials: "include",
            });

            if (response.ok) {
              console.log("✅ Sesión cerrada");
              window.location.reload();
            }
          } catch (error) {
            console.error("❌ Error al cerrar sesión:", error);
          }
        });
      }
      return data;
    } else {
      console.log("❌ No hay sesión activa");
      console.log("💡 Asegúrate de haber iniciado sesión en /login");

      // Mostrar botón de login
      if (loginBtnNav) {
        loginBtnNav.classList.remove("hidden");
      }

      // Ocultar perfil de usuario
      if (userProfileNav) {
        userProfileNav.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("❌ Error al verificar sesión:", error);
  }
}

// Mostrar saludo personalizado dentro del formulario cuando el usuario está logueado
function mostrarSaludoEnFormulario(nombre) {
  if (!citaForm) return;

  // Evitar duplicados
  let saludo = document.getElementById("citaGreeting");
  if (!saludo) {
    saludo = document.createElement("div");
    saludo.id = "citaGreeting";
    saludo.className = "mb-4 text-center";
    citaForm.parentElement.insertBefore(saludo, citaForm);
  }

  saludo.innerHTML = `   <p class="text-gray-700 text-lg">Hola, <span class="font-semibold text-amber-600">${nombre}</span> 👋</p>\n    <p class="text-sm text-gray-500 mt-1">Te mostraremos opciones ya personalizadas según tu cuenta.</p>  `;
}

citaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Capturar datos del formulario
  const tipoServicio = document.getElementById("servicio").value;
  const fechaCita = document.getElementById("fecha").value;
  const horaCita = document.getElementById("hora").value;
  const notasCita = document.getElementById("notas").value;

  // Validar que la fecha y hora no sean pasadas
  const ahora = new Date();

  // Separar fecha y hora
  const [year, month, day] = fechaCita.split("-").map(Number);
  const [hours, minutes] = horaCita.split(":").map(Number);

  // Crear fecha seleccionada
  const fechaSeleccionada = new Date(year, month - 1, day, hours, minutes);
  console.log("📅 Fecha seleccionada:", fechaSeleccionada);
  console.log("📅 Fecha actual:", ahora);

  if (fechaSeleccionada <= ahora) {
    Swal.fire({
      icon: "error",
      title: "No puedes seleccionar una fecha u hora pasada",
      text: "Por favor selecciona una fecha y hora válida en el futuro",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
    return;
  }

  // Validaciones básicas
  if (!tipoServicio || !fechaCita || !horaCita) {
    Swal.fire({
      icon: "error",
      title: "Campos incompletos",
      text: "Por favor completa servicio, fecha y hora",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
    return;
  }

  // Si NO hay sesión, redirigir a login
  if (!datosSesion || !datosSesion.autenticado) {
    Swal.fire({
      icon: "warning",
      title: "Debes iniciar sesión",
      text: "Para agendar una cita necesitas tener una cuenta",
      confirmButtonColor: "#d97706",
      confirmButtonText: "Ir a Login",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    });
    return;
  }

  // Mostrar loading
  Swal.fire({
    title: "Creando cita...",
    text: "Por favor espera",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    // Preparar datos para enviar
    const citaData = {
      id_usuario: datosSesion.usuario.id,
      id_servicio: parseInt(tipoServicio), // Asegúrate que sea el ID del servicio
      fecha_cita: fechaCita,
      hora_cita: horaCita,
      estado: "pendiente",
    };
    console.log("📝 Datos de la cita preparados:", citaData);

    console.log("📤 Enviando cita:", citaData);
    console.log("🔍 Tipo de servicio original:", tipoServicio);
    console.log("🔍 Tipo de servicio parseado:", parseInt(tipoServicio));
    console.log("🔍 ID usuario:", datosSesion.usuario.id);

    // Enviar al backend
    const response = await fetch("/api/citas", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(citaData),
    });

    const data = await response.json();
    console.log("📥 Respuesta del servidor:", data);

    if (!response.ok) {
      // Error del servidor
      throw new Error(data.message || "Error al crear la cita");
    }

    // Éxito
    await Swal.fire({
      icon: "success",
      title: "¡Cita creada!",
      html: `
        <p class="mb-2">Tu cita ha sido agendada exitosamente</p>
        <p class="text-sm text-gray-600">📅 ${fechaCita} a las ${horaCita}</p>
        <p class="text-sm text-gray-500 mt-2">Estado: Pendiente de confirmación</p>
      `,
      confirmButtonColor: "#d97706",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });

    // Limpiar formulario
    citaForm.reset();

    // Restaurar valores de sesión
    if (datosSesion) {
      document.getElementById("nombre").value = datosSesion.usuario.nombre;
      document.getElementById("email").value = datosSesion.usuario.email;
    }
  } catch (error) {
    console.error("❌ Error al crear cita:", error);

    Swal.fire({
      icon: "error",
      title: "Error al crear cita",
      text: error.message || "No se pudo crear la cita. Intenta nuevamente.",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "rounded-lg",
      },
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  datosSesion = (await verificarSesion()) || null;
  if (datosSesion && datosSesion.autenticado) {
    const { nombre, email, telefono } = datosSesion.usuario;
    mostrarSaludoEnFormulario(nombre);
    await autoCompletadoInputs(nombre, email, telefono);
  }
  cargarServicios();
});

async function autoCompletadoInputs(nombre, email, telefono) {
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const telefonoInput = document.getElementById("telefono");

  if (nombreInput) nombreInput.value = nombre;
  if (emailInput) emailInput.value = email;
  if (telefonoInput) telefonoInput.value = telefono;
}

async function cargarServicios() {
  const selectService = document.getElementById("servicio");
  const response = await fetch("/api/servicios");
  const servicios = await response.json();
  console.log("Servicios cargados:", servicios);

  servicios.services.forEach((servicio) => {
    const option = document.createElement("option");
    option.value = servicio.id;
    option.textContent = servicio.nombre;
    selectService.appendChild(option);
  });
}
