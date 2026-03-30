// Elementos del DOM

const registroForm = document.getElementById("registro-form");
const registroButton = document.getElementById("registro-btn");
const errorMesageDiv = document.getElementById("error-message");
const successMessageDiv = document.getElementById("success-message");
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function mostrarMensajeError(mensaje) {
  errorMesageDiv.textContent = mensaje;
  errorMesageDiv.style.display = "block";

  setTimeout(() => {
    errorMesageDiv.style.display = "none";
  }, 4000);
}

function mostrarMensajeExito(mensaje) {
  successMessageDiv.textContent = mensaje;
  successMessageDiv.style.display = "block";
  setTimeout(() => {
    successMessageDiv.style.display = "none";
  }, 4000);
}

//manejo del registro
registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Deshabilitar botón para evitar envíos duplicados
  if (registroButton) {
    registroButton.disabled = true;
    registroButton.classList.add("opacity-50", "cursor-not-allowed");
  }

  // Normalizar/trimear inputs antes de validar y enviar
  const nombreEl = document.getElementById("nombre");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const telefonoEl = document.getElementById("telefono");
  const confirmarEl = document.getElementById("confirm-password");

  const nombre = (nombreEl?.value || "").trim();
  const email = (emailEl?.value || "").trim().toLowerCase();
  const password = passwordEl?.value || "";
  const telefono = (telefonoEl?.value || "").trim();
  const confirmarPassword = confirmarEl?.value || "";

  const isValid = validarFormulario({
    dataUser: { nombre, email, password, telefono, confirmarPassword },
  });
  if (!isValid) {
    if (registroButton) {
      registroButton.disabled = false;
      registroButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
    return;
  }

  try {
    const response = await fetch("/auth/registro", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ nombre, email, password, telefono }),
    });
    const data = await response.json();
    console.log("Respuesta del servidor:", data); // Ver toda la respuesta

    if (response.ok) {
      mostrarMensajeExito(data.message || "Registro exitoso");
      registroForm.reset();
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    } else {
      // Si el servidor devuelve un array de errores, mostrar todos
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        mostrarMensajeError(data.errors.join(". "));
      } else {
        mostrarMensajeError(data.message || "Error en el registro");
      }
    }
  } catch (error) {
    console.error("Error en fetch registro:", error);
    mostrarMensajeError("Error de red, intenta nuevamente");
  } finally {
    if (registroButton) {
      registroButton.disabled = false;
      registroButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }
});

//funcion para validar en cliente antes de enviar al servidor
function validarFormulario({ dataUser }) {
  const { nombre, email, telefono, password, confirmarPassword } = dataUser;
  if (!nombre || !email || !password) {
    mostrarMensajeError("Nombre, email y contraseña son obligatorios");
    return false;
  }
  if (telefono && telefono.length < 10) {
    mostrarMensajeError("Telefono inválido");
    return false;
  }

  if (emailRegex.test(email) === false) {
    mostrarMensajeError("Email invalido");
    return false;
  }

  if (passwordRegex.test(password) === false) {
    mostrarMensajeError(
      "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números",
    );
    return false;
  }

  if (password !== confirmarPassword) {
    mostrarMensajeError("Las contraseñas no coinciden");
    return false;
  }

  return true;
}
