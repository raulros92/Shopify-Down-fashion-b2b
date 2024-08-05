// Comprobamos que un script previo no haya definido "variant_matrix_container".
if (typeof variant_matrix_container != 'undefined') {
  // Si la variable ya existe, significa que este snippet ya ha sido renderizado previamente.
  matrix_container_counter++;
  // Obtenemos el container con el índice indicado en el contador.
  variant_matrix_container = document.querySelectorAll('#matrix-container')[matrix_container_counter];
} else {
  // Si no existe inicializamos la variables.
  var matrix_container_counter = 0;
  var variant_matrix_container = document.querySelectorAll('#matrix-container')[matrix_container_counter];
}

// De esta manera evitamos colisiones.
new (class Variant_Matrix {
  container;
  button;
  loader;
  regExp = new RegExp('/products/([^/?]+)');
  //productHandle = this.regExp.exec(window.location.href)[1];

  constructor(container) {
    this.container = container;
    this.button = container.querySelector('#matrix-button');
    this.loader = container.querySelector('.loader-matrix-button');
  }

  init = () => {
    this.loader.style.display = 'none';
    // Añado el EventListener
    this.button.addEventListener('click', async () => {
      // Obtenemos un mapa que asocia las IDs de los productos con sus cantidades.
      const quantities = this.#tableToQuantities(this.container);
      if (!quantities) return console.error('Todos los inputs son 0 o no hay stock de nada.');
      // Deshabilitamos el botón.
      this.button.disabled = true;
      // Actualizamos el carrito.
      //this.#updateCart(Object.fromEntries(quantities));
      console.log('use updateAndRenderCart');
      updateAndRenderCart(quantities, () => {
        this.loader.style.display = 'none';
        if (typeof this.button != 'undefined') this.button.disabled = false;
        const modal = this.button.closest('.upng-popup-modal');
        if (modal) modal.hide();

        let botonVariantId;
        let botonUrl;
        // Buscar el botón que tiene la clase option-variante-marcada
        const botonMarcado = document.querySelector('.option-variante-marcada');
        // Verificar si se encontró algún botón marcado
        if (botonMarcado) {
          // Obtener el valor del atributo data-variant-id
          botonVariantId = botonMarcado.getAttribute('data-variant-id');
          botonUrl = botonMarcado.getAttribute('data-url');

          if (typeof variantTableInstancia !== 'undefined') {
            // Usar botonVariantId si tiene valor, de lo contrario, usar activeVariantId
            variantTableInstancia.updateTableBody(botonVariantId, botonUrl);
          }
        }
      });
    });
  };

  #tableToQuantities = (container) => {
    // Obtenemos todas las filas
    const rows = container.querySelectorAll('.key2-row');
    const result = new Map();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Obtenemos todos los inputs de una fila
      const inputs = row.getElementsByTagName('input');
      for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        // Obtenemos el valor de cada input y su id
        let quantity = parseInt(input.value);
        const variantID = input.id;
        if (quantity < 0) quantity = 0;
        if (quantity > parseInt(input.max)) quantity = parseInt(input.max);
        // En el liquid he establecido que si un objeto no tiene stock, tendrá ID = 0.
        // Por lo que si su ID es distinta de 0 significa que podemos añadir el producto al carrito, y por lo tanto al mapa también.
        if (variantID != 0) result.set(variantID, quantity);
      }
    }
    // Si el mapa está vacío devolvemos nulo.
    if (result.size == 0) return null;
    // Devolvemos el 0
    return result;
  };
})(variant_matrix_container).init();
