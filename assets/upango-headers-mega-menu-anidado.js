
function openMegaMenu(event, index, div) {
    const megaMenuContainer = document.getElementById(div + index);
    if (megaMenuContainer.style.display === "none") {
        /*
        {% comment %}
            Controlamos el caso de que en caso de que hayan más link de este tipo especial al tener abierto uno y pulsemos el otro
            el que esta visible se cierre.
        {% endcomment %}
        */

        const megaMenus = document.querySelectorAll(".megaMenu");
        megaMenus.forEach(menu => {
            if (menu.id === div + index) {
                // Si es el div correspondiente al enlace actual, no lo ocultamos
                return;
            }
            menu.style.display = "none";
        });

        megaMenuContainer.style.display = "block";
        document.addEventListener('click', function (event) {
            closeMegaMenuOutside(event, index, div);
        });

    } else {
        megaMenuContainer.style.display = "none";
        document.removeEventListener('click', function (event) {
            closeMegaMenuOutside(event, index, div);
        });
    }

    event.stopPropagation();
}

function closeMegaMenuOutside(event, index, div) {
    const megaMenuContainer = document.getElementById(div + index);
    if (!megaMenuContainer.contains(event.target)) {
        megaMenuContainer.style.display = "none";
        document.removeEventListener('click', function (event) {
            closeMegaMenuOutside(event, index, div);
        });
    }
}
