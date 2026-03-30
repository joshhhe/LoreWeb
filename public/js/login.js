// Elementos del DOM
const loginForm = document.getElementById("login-form");
const mostrarMensajeErrorDiv = document.getElementById("error-message");
const mostrarMensajeExitoDiv = document.getElementById("success-message");
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const btnLogin = document.getElementById("login-btn");

// Asegurar que el botón esté habilitado al cargar la página
window.addEventListener("pageshow", function (event) {
  btnLogin.disabled = false;
  btnLogin.textContent = "Iniciar Sesión";
});

//manejo del login

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Enviando formulario de login...");
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!emailRegex.test(email)) {
    mostrarMensajeError("Email inválido");
    return;
  }
  if (!password || password.length < 6) {
    mostrarMensajeError("Mínimo 6 caracteres en la contraseña");
    return;
  }
  btnLogin.disabled = true;
  btnLogin.textContent = "Iniciando sesión...";

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      mostrarMensajeExito(data.message || "Login exitoso");
      // No rehabilitar botón porque vamos a redirigir
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1000);
    } else if (response.status === 429) {
      // ⚠️ RATE LIMIT ALCANZADO
      const retryAfter = response.headers.get("Retry-After");
      const minutos = retryAfter ? Math.ceil(retryAfter / 60) : 15;

      mostrarMensajeError(
        `🔒 ${data.message} Debes esperar ${minutos} minutos.`
      );

      // Desactivar botón permanentemente hasta que se recargue la página
      btnLogin.disabled = true;
      btnLogin.textContent = `Bloqueado por ${minutos} min`;
      btnLogin.classList.add("opacity-50", "cursor-not-allowed");

      // Opcional: Recargar la página después del tiempo de espera
      setTimeout(() => {
        location.reload();
      }, retryAfter * 1000 || 15 * 60 * 1000);
    } else {
      mostrarMensajeError(data.message || "Error en el login");
      // Rehabilitar botón solo si hay error normal
      btnLogin.disabled = false;
      btnLogin.textContent = "Iniciar Sesión";
    }
  } catch (error) {
    mostrarMensajeError("Error de conexión. Intenta nuevamente");
    // Rehabilitar botón solo si hay error
    btnLogin.disabled = false;
    btnLogin.textContent = "Iniciar Sesión";
  }
});

function mostrarMensajeError(mensaje) {
  mostrarMensajeErrorDiv.textContent = mensaje;
  mostrarMensajeErrorDiv.classList.remove("hidden");
  mostrarMensajeErrorDiv.style.display = "block";

  // Si es un mensaje de rate limit, no ocultarlo automáticamente
  if (mensaje.includes("🔒") || mensaje.includes("Bloqueado")) {
    // Mantener el mensaje visible permanentemente
    return;
  }

  // Para errores normales, ocultar después de 4 segundos
  setTimeout(() => {
    mostrarMensajeErrorDiv.classList.add("hidden");
    mostrarMensajeErrorDiv.style.display = "none";
  }, 4000);
}

function mostrarMensajeExito(mensaje) {
  mostrarMensajeExitoDiv.textContent = mensaje;
  mostrarMensajeExitoDiv.style.display = "block";

  setTimeout(() => {
    mostrarMensajeExitoDiv.style.display = "none";
  }, 2000);
}
