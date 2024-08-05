// Comprobamos si ya existe la variable.
if (typeof tabla_variantes_container != 'undefined') {
  // Si ya existe, significa que esta no es la primera vez que el script se ejecuta y podemos aumentar el contador.
  tabla_variantes_counter++;
  // El div a selecionar será el elemento con índice igual al contador.
  tabla_variantes_container = document.querySelectorAll('#variant-table-container')[tabla_variantes_counter];
} else {
  // Si no existe, creamos el contador y lo inicializamos a 0
  var tabla_variantes_counter = 0;
  // Buscamos la primera tabla de variantes.
  var tabla_variantes_container = document.querySelectorAll('#variant-table-container')[tabla_variantes_counter];
}

// Prevenimos colisiones con otras variables de esta manera.
class Variant_Table {
  container;
  button;

  constructor(container) {
    this.container = container;
    // Seleccionamos el botón dentro del contenedor.
    this.button = container.querySelector('#variantTableBtn');

    // Bind del evento a los botones de opciones de variantes
    const variantButtons = document.querySelectorAll('.opcion-variante');
    variantButtons.forEach(button => {
      button.addEventListener('click', (event) => {

        // Eliminar la clase option-variante-marcada de todos los botones
        variantButtons.forEach(btn => {
          btn.classList.remove('option-variante-marcada');
        });

        // Asignar la clase option-variante-marcada al botón pulsado
        event.target.classList.add('option-variante-marcada');

        const variantId = event.target.getAttribute('data-variant-id');
        const productUrl = event.target.getAttribute('data-url');
        this.updateTableBody(variantId, productUrl);
      });
    });

    // Obtener el primer botón por su id específico
    const primerBoton = document.getElementById(buttonIdVariantOptionActive);

    // Añadir la clase deseada al primer botón
    if (primerBoton) {
      primerBoton.classList.add('option-variante-marcada');
    }
  }

  // Creamos el eventListener del botón.
  init = () => {
    this.shopifyFix();
    this.button.addEventListener('click', () => {
      const productsMap = this.getAmountsFromTable();
      if (productsMap.size == 0) return console.error('Ningún producto ha sido añadido');
      console.log(productsMap);
      this.button.disabled = true;
      //this.updateCart(productsMap);
      updateAndRenderCart(productsMap, () => {
        this.button.disabled = false;
      });
    });
  };

  // Por algún motivo, Shopify va a intentar establecer el valor del primer input con clase
  // "quantity__input" dentro de la sección "main-product" a 0,
  // independientemente del bloque al que pertenezca,
  // con esta función nos aseguramos que el valor del carrito se establezca como el valor del input.
  shopifyFix = () => {
    // Solo ocurre con el primer input, podemos ignorar el resto.
    const inputFix = this.container.querySelectorAll('input[type=number]')[0];
    inputFix.value = parseInt(inputFix.getAttribute('data-cart-quantity'));
  };

  // Esta función convierte el valor de todos los inputs en un mapa que asocia su id con su cantidad.
  getAmountsFromTable = () => {
    // Conseguimos un array con todos los inputs de la tabla.
    const inputs = this.container.querySelectorAll('input[type=number]');
    const res = new Map();
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      let quantity = parseInt(input.value);
      // Si la cantidad es mayor que el máximo, igualamos la cantidad al máximo.
      if (quantity < 0) quantity = 0;
      if (quantity > parseInt(input.max)) quantity = parseInt(input.max);
      res.set(input.id, quantity);
    }
    return res;
  };

  // Función para actualizar el contenido del tbody
  updateTableBody = async (variantId, productUrl) => {
    try {
      // Obtiene la URL actual de la página
      console.log(productUrl);
      //let url = new URL(window.location.href);
      // Añade o reemplaza el parámetro 'variant' en la URL
      //url.searchParams.set('variant', variantId);

      let url = productUrl + '?variant=' + variantId;

      console.log('Nueva URL con variante:', url.toString());

      // Realiza la llamada a la URL actual
      const response = await fetch(url);
      const text = await response.text();

      // Crea un nuevo elemento DOM para poder manipular el HTML recibido
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      console.log(document);

      //Actualizar tabla

      // Selecciona el nuevo tbody del HTML recibido
      const newTbody = doc.querySelector('#tableBody');

      // Selecciona el tbody actual de la tabla
      const currentTbody = document.querySelector('#tableBody');

      // Reemplaza el contenido del tbody actual con el nuevo contenido
      if (newTbody && currentTbody) {
        currentTbody.innerHTML = newTbody.innerHTML;
      }

      //Actualizar imagen

      // Selecciona la nueva imagen del HTML recibido
      const newImage = doc.querySelector('.grid__item.product__media-wrapper');

      // Selecciona la imagen actual del producto
      const currentImage = document.querySelector('.grid__item.product__media-wrapper');

      // Reemplaza el contenido de la imagen actual con el nuevo contenido
      if (newImage && currentImage) {
        currentImage.innerHTML = newImage.innerHTML;
      }

      //Funcionalidad de imagen de abrir lightBox
      const mediaImagenNew = doc.querySelector('.product-media-modal');

      // Selecciona el tbody actual de la tabla
      const mediaImagen = document.querySelector('.product-media-modal');

      // Reemplaza el contenido del tbody actual con el nuevo contenido
      if (mediaImagenNew && mediaImagen) {
        mediaImagen.innerHTML = mediaImagenNew.innerHTML;
      }

      // Restablecer y ejecutar el script EnableZoomOnHover-main
      const oldEnableZoomScript = document.querySelector('#EnableZoomOnHover-main');
      if (oldEnableZoomScript) {
        oldEnableZoomScript.remove();
      }

      const newEnableZoomScript = doc.querySelector('script#EnableZoomOnHover-main');
      if (newEnableZoomScript) {
        const scriptToAdd = document.createElement('script');
        scriptToAdd.id = newEnableZoomScript.id;
        scriptToAdd.src = newEnableZoomScript.src;
        scriptToAdd.defer = newEnableZoomScript.defer;
        document.head.appendChild(scriptToAdd);
      }

      // Modifica la URL de la página a la actual
      history.pushState({}, '', url.toString());

    } catch (error) {
      console.error('Error al actualizar el contenido de la tabla:', error);
    }
  };
}

let variantTableInstancia = new Variant_Table(tabla_variantes_container);
variantTableInstancia.init();




