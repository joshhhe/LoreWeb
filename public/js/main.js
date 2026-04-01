// Archivo JavaScript principal
console.log("✅ LoreWeb cargado correctamente");

// Verificar sesión del usuario
async function verificarSesion() {
  try {
    console.log("🔍 Verificando sesión...");

    const response = await fetch("/auth/sesion", {
      method: "GET",
      credentials: "include", // Importante: incluir cookies
    });

    console.log("📡 Response status:", response.status);

    const data = await response.json();
    console.log("📦 Respuesta completa del servidor:", data);

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

// Aquí puedes agregar tu código JavaScript
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM completamente cargado");
  console.log("¡Bienvenido a LoreWeb!");

  // Verificar sesión al cargar la página
  verificarSesion();

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener("click", () => {
      // Toggle visibility on small screens
      mainNav.classList.toggle("hidden");
      // Ensure it displays vertically on mobile when visible
      if (!mainNav.classList.contains("hidden")) {
        mainNav.classList.add(
          "flex",
          "flex-col",
          "gap-4",
          "p-4",
          "absolute",
          "left-0",
          "right-0",
          "top-full",
          "bg-white",
          "shadow-md",
          "z-50",
        );
      } else {
        mainNav.classList.remove(
          "flex",
          "flex-col",
          "gap-4",
          "p-4",
          "absolute",
          "left-0",
          "right-0",
          "top-full",
          "bg-white",
          "shadow-md",
          "z-50",
        );
      }
    });
  }
});
