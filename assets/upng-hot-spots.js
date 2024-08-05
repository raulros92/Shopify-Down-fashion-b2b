if (typeof hotspot_container != 'undefined') {
  hotspot_counter++;
  hotspot_container = document.querySelectorAll('.hotspot-container')[hotspot_counter];
  hotspot_mobile_container = document.querySelectorAll('.hotspot-container-mobile')[hotspot_counter];
} else {
  var hotspot_counter = 0;
  var hotspot_container = document.querySelectorAll('.hotspot-container')[hotspot_counter];
  var hotspot_mobile_container = document.querySelectorAll('.hotspot-container-mobile')[hotspot_counter];
}

(function (container, container_mobile) {
  /**
   * @param {boolean} isMobile
   * @returns {number}
   */
  function getCircleWidth(isMobile = false) {
    if (isMobile) {
      const hotspot = container_mobile.querySelector('.hotspot');
      const width = hotspot.style.width;
      return parseFloat(width.split('em')[0]);
    }
    const hotspot = container.querySelector('.hotspot');
    const width = hotspot.style.width;
    return parseFloat(width.split('em')[0]);
  }

  /**
   * @param {Element} element
   */
  function isDivOverflowingRight(element, windowDimensions) {
    const bounding = element.getBoundingClientRect();
    if (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.right <= (windowDimensions.innerWidth || document.documentElement.clientWidth) &&
      bounding.bottom <= (windowDimensions.innerHeight || document.documentElement.clientHeight)
    ) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * @param {Element} content
   */
  function displayContentContainer(content) {
    // En dispositivos móbiles, el navegador reporta unos valores más grandes de lo que debería cuando hay contenido que se sale de la pantalla.
    // Si capturamos los valores antes de mostrar un hotspot que posiblemente se salga de la pantalla, nos aseguramos de estar operando con valores reales.
    const windowDimensions = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
    content.style.display = 'flex';
    let doesitfit = isDivOverflowingRight(content, windowDimensions);
    const hotspotWidth = getCircleWidth(content.parentElement.classList.contains('hotspot-container-mobile'));
    if (!doesitfit) {
      content.style.left = 'unset';
      content.style.right = '1em';
      if (!isDivOverflowingRight(content, windowDimensions)) {
        // En caso de que el div no entre a pesar de haberlo movido.
        let MAX_ITERATIONS = 500;
        let CURRENT_ATTEMPT = 0;
        do {
          if (CURRENT_ATTEMPT >= MAX_ITERATIONS) {
            console.error('Infinite Loop Prevention Triggered');
            break;
          }
          // Conseguimos la anchura máxima del contenido
          const currentWidth = parseInt(content.style.maxWidth.split('em'));
          // Le restamos 5 unidades hasta que entre en el viewport actual.
          content.style.maxWidth = currentWidth - 5 + 'em';
          if (currentWidth <= 0 && CURRENT_ATTEMPT > 0) {
            console.error('Hay un hotspot cuyo contenido no puede entrar en la pantalla de ninguna manera.');
            break;
          }
          if (currentWidth <= 0 && CURRENT_ATTEMPT == 0) {
            content.style.left = `${hotspotWidth + 1}em`;
            content.style.right = 'unset';
            content.style.maxWidth = '30em';
            CURRENT_ATTEMPT++;
          } else {
            CURRENT_ATTEMPT++;
          }
        } while (!isDivOverflowingRight(content, windowDimensions) && CURRENT_ATTEMPT < MAX_ITERATIONS);
      }
    } else {
      if (content.style.left == 'unset') {
        return;
      }
      content.style.left = `${hotspotWidth + 1}em`;
      content.style.right = 'unset';
    }
  }
  /**
   * @param {Element} content
   */
  function resetContentContainer(content) {
    const hotspotWidth = getCircleWidth();
    content.style.maxWidth = '40em';
    content.style.left = `${hotspotWidth + 1}em`;
    content.style.right = 'unset';
    content.style.display = 'none';
  }
  const content = hotspot_container.querySelector('.hotspot-content');
  const mobile_content = hotspot_mobile_container.querySelector('.hotspot-content');
  let hotspot_timeout;
  hotspot_container.addEventListener('mouseover', () => {
    if (hotspot_timeout) {
      clearTimeout(hotspot_timeout);
    }
    container.style.zIndex = 2;
    displayContentContainer(content);
  });
  hotspot_mobile_container.addEventListener('click', () => {
    container_mobile.style.zIndex = 2;
    displayContentContainer(mobile_content);
    resetContentContainer(mobile_content);
    displayContentContainer(mobile_content);
  });
  hotspot_container.addEventListener('mouseleave', () => {
    hotspot_timeout = setTimeout(() => {
      container.style.zIndex = 2;
      resetContentContainer(content);
    }, 200);
  });
  hotspot_mobile_container.addEventListener('mouseleave', () => {
    container_mobile.style.zIndex = 1;
    resetContentContainer(mobile_content);
  });
})(hotspot_container, hotspot_mobile_container);
