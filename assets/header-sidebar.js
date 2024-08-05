/* Set the width of the sidebar to 250px (show it) */
function openSideBarMenu() {
  const sidepanel = document.getElementById("sideBarPanel");
  /*if (sidepanel.style.width === "500px") {
    sidepanel.style.width = "0";
  } else {
    sidepanel.style.width = "500px";
  }*/
  sidepanel.classList.toggle("open-sidebar");
  document.body.classList.add('overflow-hidden-desktop');
  
}

/* Set the width of the sidebar to 0 (hide it) */
function closeSideBarMenu() {
  /*document.getElementById("sideBarPanel").style.width = "0";*/
  document.getElementById("sideBarPanel").classList.remove("open-sidebar");
  document.body.classList.remove('overflow-hidden-desktop');
}


function openLinkOption(evt, ramaName) {
    // Ocultar todos los elementos con clase "tabcontent" y remover la clase "visible"
    document.querySelectorAll(".tabcontent").forEach(function(el) {
        el.style.display = "none";
        el.classList.remove("visible");
    });

    // Remover la clase "active" de todos los elementos con clase "tablinks"
    document.querySelectorAll(".tablinks").forEach(function(el) {
        el.classList.remove("active");
    });

    // Mostrar el tab actual, añadir la clase "active" al botón que abrió el tab
    // y añadir la clase "visible" al elemento mostrado
    var activeTab = document.getElementById(ramaName);
    activeTab.style.display = "block";
    activeTab.classList.add("visible");
    evt.currentTarget.classList.add("active");
}


function redirectToSite(url) {
  window.location.href = url;
}

document.addEventListener("DOMContentLoaded", function () {
// Función para mostrar los detalles al pasar el cursor por encima del enlace
function showDetails() {

    if (!this.classList.contains("childLinkConDetails")) {
      return; // Si no tiene la clase adecuada, salir de la función
    }
    // Obtener todos los enlaces dentro de los elementos details
    let grandchildLinks = document.querySelectorAll("details > summary");
    grandchildLinks.forEach(function (link) {
      if (link !== this) {
        link.parentElement.removeAttribute("open");
        link.setAttribute("aria-expanded", "false");
      }
    });

    let details = this.parentElement;
    details.setAttribute("open", "true");
    this.setAttribute("aria-expanded", "true");
  }

  // Función para cerrar todos los grandchildLinks
  function closeAllGrandchildLinks() {
    let grandchildLinks = document.querySelectorAll("details > summary.childLinkConDetails");
    grandchildLinks.forEach(function (link) {
      link.parentElement.removeAttribute("open");
      link.setAttribute("aria-expanded", "false");
    });
  }

  // Obtener todos los botones de tipo tablinks
  let tabButtons = document.querySelectorAll(".tablinks");

  // Asociar evento de clic a cada botón tablinks
  tabButtons.forEach(function (button) {
    button.addEventListener("mouseenter", closeAllGrandchildLinks);
  });

  // Obtener todos los enlaces dentro de los elementos details y los que tienen la clase childLinkSinDetails
  let allLinks = document.querySelectorAll("details > summary, details > summary > a, .childLinkSinDetails");

  // Asociar eventos de mouseenter y mouseleave a cada enlace
  allLinks.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      if (!this.classList.contains("childLinkSinDetails")) {
        showDetails.call(this);
      } else {
        let grandchildLinks = document.querySelectorAll("details > summary.childLinkConDetails");
        grandchildLinks.forEach(function (link) {
          link.parentElement.removeAttribute("open");
          link.setAttribute("aria-expanded", "false");
        });
      }
    });
  });
});



