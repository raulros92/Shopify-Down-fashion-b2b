document.addEventListener('DOMContentLoaded', function () {
  // Select the container that holds the SKU information
  const containerSku = document.querySelector('.product-sku');
  // Select all color buttons
  const colorBtns = document.querySelectorAll('.variant-image-btn-main');

  // Loop through each color button and add a click event listener
  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove the 'variant-image-main-selected' class from all buttons
      colorBtns.forEach((btn) => btn.classList.remove('variant-image-main-selected'));

      // Add the 'variant-image-main-selected' class to the clicked button
      btn.classList.add('variant-image-main-selected');

      // Change the SKU
      const newSku = btn.getAttribute('data-sku');
      if (newSku) {
        // Find the element that displays the SKU and update its content
        const skuContainer = containerSku.querySelector('.sku-value');
        skuContainer.textContent = newSku;
      }
    });
  });
});

// LOGICA PARA LOS COLORES Y SKU EN FICHA PRODUCTO SIN TABLA DE VARIANTES
// document.addEventListener('DOMContentLoaded', function () {
//   //Escuchar clics en los botones color
//   const container = document.querySelector('.product__media');
//   const containerSku = document.querySelector('.product-sku');
//   const image = container.querySelector('img');
//   image.srcset = '';
//   const colorBtns = document.querySelectorAll('.variant-image-btn');
//   colorBtns.forEach((btn) => {
//     // Eliminar la clase 'variant-image-btn.selected' de todos los botones
//     colorBtns.forEach((btn) => btn.classList.remove('variant-image-selected'));

//     // Agregar la clase 'variant-image-btn.selected' al botón clickeado
//     btn.classList.add('variant-image-selected');

//     // Cambiar la imagen y el SKU
//     btn.addEventListener('click', () => {
//       const newSku = btn.getAttribute('data-sku');
//       if (newSku) {
//         // Encuentra el elemento de sku en el contenedor actual de la tarjeta
//         const skuContainer = containerSku.querySelector('.sku-value');
//         // Actualiza el valor del SKU
//         skuContainer.textContent = newSku;
//       }

//       // Código para cambiar imágenes cuando se usa: Logica para implementar colores y mostrar SKU / sin Tabla variantes
//       const newSrc = btn.getAttribute('image-data');
//       if (newSrc) {
//         image.src = newSrc;
//       }
//     });
//   });
// });
