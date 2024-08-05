(function () {
  const gridContainer = document.querySelector('#ProductGridContainer');
  const productCard = gridContainer.querySelectorAll('.grid__item');
  productCard.forEach((card) => {
    const variantBtns = card.querySelectorAll('.variant-image-btn[image-data]');
    // La primera imagen es la que muestra shopify
    if (!card.querySelector('.card__media')) return;
    const img = card.querySelector('.card__media').querySelector('img');
    img.removeAttribute('srcset');
    variantBtns.forEach((btn) => {
      if (!btn.getAttribute('image-data')) return;
      btn.addEventListener('click', () => {
        const newSrc = btn.getAttribute('image-data');
        img.src = newSrc;
      });
    });
  });
})();