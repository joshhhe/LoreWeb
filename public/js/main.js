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

  // Mobile menu functionality
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");

  if (mobileBtn && mainNav) {
    let isMenuOpen = false;

    // Crear overlay para cerrar el menú
    const overlay = document.createElement("div");
    overlay.id = "mobileOverlay";
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 z-40 hidden transition-opacity duration-300";
    document.body.appendChild(overlay);

    // Configurar atributos de accesibilidad
    mobileBtn.setAttribute("aria-expanded", "false");
    mobileBtn.setAttribute("aria-controls", "mainNav");

    // Función para abrir el menú
    function openMenu() {
      isMenuOpen = true;

      // Mostrar overlay
      overlay.classList.remove("hidden");
      setTimeout(() => (overlay.style.opacity = "1"), 10);

      // Obtener la posición del botón para alinear el menú
      const btnRect = mobileBtn.getBoundingClientRect();

      // Configurar y mostrar menú desde la derecha
      mainNav.classList.remove("hidden", "md:flex", "gap-8", "items-center");
      mainNav.classList.add(
        "flex",
        "fixed",
        "w-64",
        "bg-white",
        "shadow-2xl",
        "rounded-lg",
        "z-50",
        "flex-col",
        "gap-2",
        "py-4",
        "px-3",
        "transform",
        "transition-all",
        "duration-300",
      );

      // Posicionar justo debajo del botón hamburguesa, más a la derecha
      mainNav.style.top = `${btnRect.bottom + 8}px`;
      mainNav.style.right = `16px`; // Margen fijo de 16px desde el borde derecho

      // Animar entrada desde arriba
      mainNav.style.opacity = "1";
      mainNav.style.transform = "translateY(0)";

      // Añadir padding a los elementos li para mejor espaciado
      mainNav.querySelectorAll("li").forEach((li) => {
        li.style.padding = "8px 0";
      });

      mobileBtn.setAttribute("aria-expanded", "true");
      // Permitir scroll - no bloqueamos el overflow
    }

    // Función para cerrar el menú
    function closeMenu() {
      if (!isMenuOpen) return;
      isMenuOpen = false;

      // Animar salida hacia arriba
      mainNav.style.opacity = "0";
      mainNav.style.transform = "translateY(-10px)";
      overlay.style.opacity = "0";

      setTimeout(() => {
        // Restaurar clases originales después de la animación
        mainNav.classList.add("hidden", "md:flex", "gap-8", "items-center");
        mainNav.classList.remove(
          "flex",
          "fixed",
          "w-64",
          "shadow-2xl",
          "rounded-lg",
          "z-50",
          "flex-col",
          "gap-2",
          "py-4",
          "px-3",
          "transform",
          "transition-all",
          "duration-300",
        );
        mainNav.style.transform = "";
        mainNav.style.opacity = "";
        mainNav.style.top = "";
        mainNav.style.right = "";

        // Limpiar padding de los elementos li
        mainNav.querySelectorAll("li").forEach((li) => {
          li.style.padding = "";
        });

        overlay.classList.add("hidden");
        // Scroll permitido - no restauramos overflow
      }, 300);

      mobileBtn.setAttribute("aria-expanded", "false");
    }

    // Toggle menú al hacer click en el botón hamburguesa
    mobileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.innerWidth < 768) {
        // Solo en móvil
        if (isMenuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    });

    // Cerrar menú al hacer click en el overlay
    overlay.addEventListener("click", closeMenu);

    // Cerrar menú al hacer click en un enlace
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 768) {
          closeMenu();
        }
      });
    });

    // Cerrar menú al redimensionar a desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeMenu();
      }
    });

    // Inicializar con opacidad 0 y ligeramente hacia arriba
    if (window.innerWidth < 768) {
      mainNav.style.opacity = "0";
      mainNav.style.transform = "translateY(-10px)";
    }
  }
});
