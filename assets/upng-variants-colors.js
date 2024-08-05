// function chargeCardColors(btn) {} Programar funcion para que funcione colors y SKU en productos relacionados.

document.addEventListener('DOMContentLoaded', function () {
  // Escuchar clics en los botones de color
  const containers = document.querySelectorAll('.card-wrapper');
  containers.forEach((card) => {
    const colorBtns = card.querySelectorAll('.variant-image-btn');
    const image = card.querySelector('img');
    colorBtns.forEach((btn) => {
      /**
       * Handles the click event on a color variant button, updating the product image and SKU display.
       * @param {HTMLButtonElement} btn - The clicked color variant button.
       */
      btn.addEventListener('click', () => {
        // Eliminar la clase 'variant-image-btn.selected' de todos los botones
        colorBtns.forEach((btn) => btn.classList.remove('variant-image-selected'));

        // Agregar la clase 'variant-image-btn.selected' al botón clickeado
        btn.classList.add('variant-image-selected');

        // Cambiar la imagen y el SKU
        const newSrc = btn.getAttribute('image-data');
        image.src = newSrc;
        const newSku = btn.getAttribute('data-sku');
        if (newSku) {
          // Encuentra el elemento de sku en el contenedor actual de la tarjeta
          const skuContainer = card.querySelector('.sku-value');
          // Actualiza el valor del SKU
          skuContainer.textContent = newSku;
        }
      });
    });
  });
});
