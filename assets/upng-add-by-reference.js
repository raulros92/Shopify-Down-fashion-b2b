//Recogemos el input text del buscador
let upngSip_search = document.body.querySelector('#add-by-ref-search');
//Recogemos el div donde se encuentran toda la sección para añadir después el id hidden y se muestren los resultados de la búsqueda
let lienzo = document.body.querySelector('#add-by-ref-inputs');
//Recogemos el botón de añadir al carro
let upngAddByReference_btn = document.body.querySelector('#add-by-ref-btn');
//Recogemos el input de cantidad 
let upngAddByReference_cant = document.body.querySelector('#add-by-ref-cantidad');

//Creamos un div temporal para mostrar los resultados de la búsqueda
let lienzoTemp = document.createElement('div');

//variable que almacena el id del producto
let idProducto;

lienzoTemp.setAttribute('style', 'position: absolute; z-index: 2; background-color: white; max-width: 740px; border: 1px solid black;');
lienzo.appendChild(lienzoTemp);

//Tiempo de espera para que no se hagan muchas peticiones a la API de Shopify
let timeoutId;
upngSip_search.addEventListener('keyup', function (event) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(function () {
        prediccionBusqueda();
    }, 200);
});

//Función que muestra los resultados de búsqueda mediante la API
function prediccionBusqueda() {
    let terminoBusqueda = upngSip_search.value;

    lienzoTemp.innerHTML = '';

    fetch('/search/suggest.json?q=' + terminoBusqueda + '&resources[options][fields]=variants.sku,variants.barcode,variants.title')
        .then(response => response.json())
        .then(data => {

            data.resources.results.products.forEach(producto => {

                obtenerProductos(producto.handle);

            });

        });
}

function obtenerProductos(nombreProducto) {

    fetch(window.Shopify.routes.root + "products/" + nombreProducto + '.js')
        .then((response) => response.json())
        .then((producto) => {

            for (let i = 0; i < producto.variants.length; i++) {

                let idVar = producto.variants[i].id;

                let imagen = document.createElement('img');
                let titulo = document.createElement('h3');
                let precio = document.createElement('span');

                //Establecemos la imagen
                imagen.setAttribute('src', producto.images);
                imagen.setAttribute('style', 'width: 40px;');

                //Establecemos el título
                //Las variantes tienen de titulo de producto "Default Title", para que no se vea en el resultado he establecido este if
                if (producto.variants[i].title == "Default Title") {
                    titulo.textContent = producto.title;
                } else {
                    titulo.textContent = `${producto.title} - ${producto.variants[i].title}`;
                }

                //Establecemos el precio con formato (Faltaría añadir más posibles monedas)
                if (Shopify.currency.active == 'EUR') {
                    precio.textContent = ` | €${producto.variants[i].price / 100} EUR`;
                } else if (Shopify.currency.active == 'USD') {
                    precio.textContent = ` | $${producto.variants[i].price / 100} USD`;
                }

                //div que contiene la información del producto que se está recorriendo en el for
                let productoTemp = document.createElement('div');
                productoTemp.setAttribute('style', 'display: flex; flex-direction: row; align-items: center;');

                productoTemp.appendChild(imagen);
                productoTemp.appendChild(titulo);
                productoTemp.appendChild(precio);

                lienzoTemp.appendChild(productoTemp);

                productoTemp.addEventListener('click', function () {
                    upngSip_search.value = titulo.textContent;
                    lienzoTemp.innerHTML = '';
                    idProducto = idVar;

                    //Array que contiene la configuración de max, min e incrementos del producto
                    let pConfig = producto.variants[i].quantity_rule; //min, max, increment

                    upngAddByReference_cant.setAttribute('step', pConfig.increment);
                    upngAddByReference_cant.setAttribute('min', pConfig.min);
                    upngAddByReference_cant.setAttribute('max', pConfig.max);

                    if (upngAddByReference_cant.value < pConfig.min) {
                        upngAddByReference_cant.value = pConfig.min
                    } else {
                        let cociente = (upngAddByReference_cant.value - pConfig.min) / pConfig.increment;
                        let resto = Math.trunc(cociente);
                        upngAddByReference_cant.value = pConfig.min + (pConfig.increment * resto);
                    }

                });

            }

        });
}

//Obtener ID de la sección del carro para actualizarla
let cartDiv = document.querySelector("#main-cart-items");
let cartDivId = cartDiv.getAttribute("data-id");
//Obtener ID de la sección del precio para actualizarla
let prizeDiv = document.querySelector("#main-cart-footer");
let prizeDivId = prizeDiv.getAttribute("data-id");

upngAddByReference_btn.addEventListener('click', agregarProductos);

//Funcion que añade el producto al carro y actualiza la página
function agregarProductos() {

    let updateHeader = () => {
        fetch(window.Shopify.routes.root + '?sections=header')
            .then((res) => res.json())
            .then((data) => {
                document.querySelector('.section-header').innerHTML = data.header;
            });
    };
    let updateCart = () => {
        fetch(`${routes.cart_url}?section_id=${cartDivId}`)
            .then((res) => res.text())
            .then((data) => {
                document.querySelector(`#shopify-section-${cartDivId}`).innerHTML = data;
            });
    };
    let updatePrize = () => {
        fetch(`${routes.cart_url}?section_id=${prizeDivId}`)
            .then((res) => res.text())
            .then((data) => {
                document.querySelector(`#shopify-section-${prizeDivId}`).innerHTML = data;
            });
    };

    let formData = {
        'items': [{
            'id': idProducto,
            'quantity': upngAddByReference_cant.value
        }]
    };
    fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            updateHeader();
            updateCart();
            updatePrize();

            return response.json();
        })
        .catch((error) => {

            let errorMessage = errorMessages.cart_error;
            console.error('Error:', errorMessage);
            let errorMessagesParentElement = document.createElement("div");
            lienzo.after(errorMessagesParentElement);
            showErrorMessages(errorMessagesParentElement, [errorMessage]);

        });

}
