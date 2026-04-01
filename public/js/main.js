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

  // Mobile menu toggle (opens aligned to the hamburger button on the right)
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");
  if (mobileBtn && mainNav) {
    // Accessibility attributes
    mobileBtn.setAttribute("aria-expanded", "false");
    mobileBtn.setAttribute("aria-controls", "mainNav");

    const showClasses = [
      "flex",
      "flex-col",
      "gap-4",
      "p-4",
      "absolute",
      "top-full",
      "right-4",
      "w-48",
      "bg-white",
      "shadow-md",
      "rounded",
      "z-50",
    ];

    const hideMenu = () => {
      mainNav.classList.add("hidden");
      mainNav.classList.remove(...showClasses);
      mobileBtn.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      mainNav.classList.remove("hidden");
      mainNav.classList.add(...showClasses);
      mobileBtn.setAttribute("aria-expanded", "true");
    };

    mobileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth >= 768) return; // only on small screens
      if (mainNav.classList.contains("hidden")) openMenu();
      else hideMenu();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (window.innerWidth >= 768) return;
      if (
        !mainNav.classList.contains("hidden") &&
        !mainNav.contains(e.target) &&
        e.target !== mobileBtn &&
        !mobileBtn.contains(e.target)
      ) {
        hideMenu();
      }
    });

    // Close when a nav link is clicked (mobile)
    mainNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.innerWidth < 768) hideMenu();
      });
    });
  }
});
