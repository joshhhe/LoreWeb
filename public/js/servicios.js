const servicios = document.querySelectorAll(".sexo");

// referencias a botones
const btnTodos = document.getElementById("btnTodos");
const btnMujeres = document.getElementById("btnMujeres");
const btnHombres = document.getElementById("btnHombres");

function showAll() {
  servicios.forEach((s) => s.classList.remove("hidden"));
}

if (btnTodos) {
  btnTodos.addEventListener("click", () => {
    showAll();
  });
}

if (btnMujeres) {
  btnMujeres.addEventListener("click", () => {
    renderizarServicios("mujeres");
  });
}

if (btnHombres) {
  // data-sexo for hombres cards is "hombre" (singular) in the markup
  btnHombres.addEventListener("click", () => {
    renderizarServicios("hombre");
  });
}

function renderizarServicios(sexo) {
  const arrayProductos = Array.from(servicios);
  arrayProductos.forEach((producto) => producto.classList.add("hidden"));

  const serviciosFiltrados = arrayProductos.filter((producto) => {
    // accept singular/plural variants for robustness
    const ds = (producto.dataset.sexo || "").toLowerCase();
    return (
      ds === sexo.toLowerCase() ||
      ds === sexo.toLowerCase() + "s" ||
      ds + "s" === sexo.toLowerCase()
    );
  });

  serviciosFiltrados.forEach((producto) => producto.classList.remove("hidden"));
}

// show all on initial load
showAll();
