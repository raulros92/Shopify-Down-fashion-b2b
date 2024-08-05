let parser = new DOMParser();
let div = document.getElementById("ProductGridContainer");
let divPaginacion = document.getElementsByClassName("pagination-wrapper");
divPaginacion[0].setAttribute("style", "display: none;");
//let div = divPaginacion[0].previousElementSibling.previousElementSibling; //Otra forma de sacar el div que recibe la paginación

isTabla = false;

let pushStateEasyLoad = false;

let paginado = obtenerPagina()
let paginadoTabla = {};
let paginadoMosaico = {};

let botonTabla = document.getElementById("boton-tabla");
let botonMosaico = document.getElementById("boton-mosaico");

let botonesActivos = true;
try {

    let ultimaVistaPreferida = localStorage.vistaPreferida;

    botonTabla.addEventListener("click", function() {
        if (ultimaVistaPreferida == 'mosaico') {
            if (Object.keys(paginadoMosaico).length === 0) {
                //Si es la primera vez, paginadoMosaico cogerá el valor del paginado actual
                paginadoMosaico = paginado;
                paginado = obtenerPagina();
            } else {
                    paginado = paginadoTabla;
            }
        }
        ultimaVistaPreferida = localStorage.vistaPreferida;
    });
        
    botonMosaico.addEventListener("click", function() {
        if (ultimaVistaPreferida == 'tabla') {
            if (Object.keys(paginadoTabla).length === 0) {
                paginadoTabla = paginado;
                paginado = obtenerPagina();
            } else {
                paginado = paginadoMosaico;
            }
        }
        ultimaVistaPreferida = localStorage.vistaPreferida;
    });

} catch (error) {

    botonesActivos = false;
    console.log(error);

}

function obtenerPagina(nuevaURL) { 
    
    div = document.getElementById("ProductGridContainer");

    let paginado = {
        url: window.location.href
    };

    if (nuevaURL != undefined) {
        paginado.url = window.location.origin + nuevaURL;
    }
    
    paginado.pagina = 1;

    paginado.url = new URL(paginado.url);
    let parametros = new URLSearchParams(paginado.url.search);
    if (parametros.has('page')) { 
        paginado.pagina = parseInt(parametros.get('page'), 10);
    } else {
        parametros.set('page', paginado.pagina);
        paginado.url = window.location.origin + window.location.pathname + '?' + parametros.toString();
    }
    
    pushStateEasyLoad = true;
    history.pushState(null, "", paginado.url);

    paginado.pagina_min = paginado.pagina;
    paginado.pagina_max = paginado.pagina;
    paginado.ultima_pag = false;
    paginado.limite_pags = [];

    paginado.limite_pags.push(div.getBoundingClientRect().height);
    
    paginado.url = new URL(paginado.url);
    return paginado;
}

window.addEventListener("scroll", easyLoaderControlador);

function easyLoaderControlador() {

    let div = document.getElementById("ProductGridContainer");
    let height_Div = div.getBoundingClientRect().height;
    let inicio_Div = div.getBoundingClientRect().top; // + window.innerHeight;
    let fin_Div = height_Div + inicio_Div;
    let fin_Div_Abajo = fin_Div - window.innerHeight;

    if (paginado.limite_pags.length > 1) {

        for (let i = 0; i < paginado.limite_pags.length; i++) {
            let paginaHeight = paginado.limite_pags[i];

            if ((inicio_Div + paginaHeight) > 0) {
                paginado.pagina = paginado.pagina_min + i;
                let parametros = new URLSearchParams(paginado.url.search);
                parametros.set('page', paginado.pagina);
                paginado.url = window.location.origin + window.location.pathname + '?' + parametros.toString();
                paginado.url = new URL(paginado.url);
                pushStateEasyLoad = true;
                history.pushState(null, "", paginado.url);
                break;
            }
        }
    }

    if ((paginado.pagina_min > 1) && (inicio_Div > 0)) {

        if (botonesActivos) {
            botonMosaico.disabled = true;
            botonTabla.disabled = true;   
        }

        paginado.pagina_min--;
        let parametros = new URLSearchParams(paginado.url.search);
        parametros.set('page', paginado.pagina_min);
        paginado.url = window.location.origin + window.location.pathname + '?' + parametros.toString();
        paginado.url = new URL(paginado.url);
        paginado.pagina = paginado.pagina_min;

        easyLoader();
        window.removeEventListener("scroll", easyLoaderControlador);

    }

    if ((!paginado.ultima_pag) && (fin_Div_Abajo < 0)) {

        if (botonesActivos) {
            botonMosaico.disabled = true;
            botonTabla.disabled = true;   
        }

        paginado.pagina_max++;
        let parametros = new URLSearchParams(paginado.url.search);
        parametros.set('page', paginado.pagina_max);
        paginado.url = window.location.origin + window.location.pathname + '?' + parametros.toString();
        paginado.url = new URL(paginado.url);
        paginado.pagina = paginado.pagina_max;

        easyLoader();
        window.removeEventListener("scroll", easyLoaderControlador);

    }
}

function easyLoader() {
    fetch(paginado.url)
        .then((res) => res.text())
        .then((data) => {

            try {

                let htmlNuevo = parser.parseFromString(data, "text/html");
                let divPaginacionNuevo = htmlNuevo.getElementsByClassName('pagination-wrapper');

                //Sería raro no tener paginación pero por si acaso he puesto esta condición para evitar problemas
                if (divPaginacionNuevo.length>0) {

                    let divPadre = divPaginacionNuevo[0].previousElementSibling.previousElementSibling;
                    let divMosaico = htmlNuevo.getElementsByClassName('vista-mosaico')[0];
                    let divParrilla = htmlNuevo.getElementsByClassName('vista-tabla')[0];

                    if (divMosaico != undefined || divParrilla != undefined) {
                        if (localStorage.vistaPreferida == "mosaico") {

                            isTabla = false;
                            localizarElementos(divMosaico);

                        } else if (localStorage.vistaPreferida == "tabla") {

                            isTabla = true;
                            localizarElementos(divParrilla);

                        } else {
                            console.log("Problemas con vista-parrilla/mosaico");
                        }

                    } else { 
                        
                        if (divPadre.getElementsByClassName("collection--empty").length>0) {
                            
                            paginado.ultima_pag = true;
                            console.log("Parece que no hay más elementos a paginar");

                        } else {
                            localizarElementos(divPadre);
                        }
                    }

                } else {

                    paginado.ultima_pag = true;
                    console.log("La página que has llamado no tiene pagination-wrapper");
                
                }

                
                if (botonesActivos) {
                    botonMosaico.disabled = false;
                    botonTabla.disabled = false;   
                }
                window.addEventListener("scroll", easyLoaderControlador);

            } catch (error) {
                console.log(error);
            }
        })
}

function localizarElementos(divProductos) {

    if (isTabla) {
        
        let tablaT = divProductos.getElementsByTagName("table");
        if (tablaT.length != 1) {

            console.log("Error: tabla no encontrada");
            if (paginado.pagina == paginado.pagina_max) {
                paginado.ultima_pag = true;
            }

        } else {

            let indice_productos = 1;
            let filas = tablaT[0].getElementsByTagName("tr"); 
            let tabla = div.getElementsByTagName("tbody")[0];
            let listadoHeader = tabla.children[1];

            agregarProductos(indice_productos, filas, tabla, listadoHeader);

        }

    } else {
        
        let listadoT = undefined;
        let productGridLista = divProductos.getElementsByClassName("product-grid");
        for (let i = 0; i < productGridLista.length; i++) {
            let productGrid = productGridLista[i];
            if (productGrid.tagName=="UL") {
                listadoT = productGrid;
            }
        }

        if (listadoT == undefined) {

            console.log("Error: lista no encontrada");
            if (paginado.pagina == paginado.pagina_max) {
                paginado.ultima_pag = true;
            }

        } else {

            let indice_productos = 0;
            let nuevosProductos = listadoT.getElementsByTagName("li");

            //Este div no es mismo cuando hay busqueda y cuando estamos en catalogo
            
            let listado = undefined;
            let productGridLista = div.getElementsByClassName("product-grid");
            for (let i = 0; i < productGridLista.length; i++) {
                let productGrid = productGridLista[i];
                if (productGrid.tagName=="UL") {
                    listado = productGrid;
                }
            }

            agregarProductos(indice_productos, nuevosProductos, listado);

        }
    }
}

function agregarProductos(indice_productos, nuevosProductos, contenedor, listadoHeader) {

    try {

        if (paginado.limite_pags.length==1) {
            paginado.limite_pags[0] = div.getBoundingClientRect().height;
        }

        while (indice_productos < nuevosProductos.length) {

            if (paginado.pagina == paginado.pagina_max) { //añadir pagina hacia abajo

                let nuevoElemento = nuevosProductos[indice_productos];
                contenedor.appendChild(nuevoElemento);

            } else if (paginado.pagina == paginado.pagina_min) { //añadir pagina hacia arriba

                let yv1 = div.getBoundingClientRect().height;
                
                if (listadoHeader!=undefined) {
                    let nuevoElemento = nuevosProductos[indice_productos];
                    listadoHeader.parentNode.insertBefore(nuevoElemento, listadoHeader) 
                } else {
                    let nuevoElemento = nuevosProductos[nuevosProductos.length-1];
                    contenedor.insertBefore(nuevoElemento, contenedor.firstChild);
                }
                
                let yv2 = div.getBoundingClientRect().height;
                
                let coordenadaY = yv2-yv1;
                window.scrollBy(0, coordenadaY);

            }
        }

        paginado.limite_pags.push(div.getBoundingClientRect().height);

    } catch (error) {

        console.log(error);
        if (paginado.pagina == paginado.pagina_max) { //Comprueba si se ha añadido la página desde abajo
            paginado.ultima_pag = true;
        }
    }
}

(function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {

        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }

        if (!pushStateEasyLoad) {
            paginado = obtenerPagina(arguments[2]);
        }

        pushStateEasyLoad = false;
        return pushState.apply(history, arguments);
    };
    pushStateEasyLoad = false;
})(window.history);
