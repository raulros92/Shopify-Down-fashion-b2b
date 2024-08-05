if (typeof product_hotspots_container != 'undefined') {
  product_hotspots_counter++;
  product_hotspots_container = document.querySelectorAll('.product-hotspots-container')[product_hotspots_counter];
} else {
  var product_hotspots_counter = 0;
  var product_hotspots_container = document.querySelectorAll('.product-hotspots-container')[product_hotspots_counter];
}

(function (container) {
  /**
   * @returns {NodeListOf<Element>}
   */
  function getAllHotspots() {
    const hotspots = container.querySelectorAll('.hotspot-container');
    return hotspots;
  }

  /**
   * @returns {NodeListOf<Element>}
   */
  function getAllMobileHotspots() {
    const hotspots = container.querySelectorAll('.hotspot-container-mobile');
    return hotspots;
  }

  /**
   * @returns {NodeListOf<Element>}
   */
  function getAllProductBoxes() {
    const boxes = container.querySelectorAll('.detailedProduct');
    return boxes;
  }

  function showRandom() {
    const boxes = getAllProductBoxes();
    if (boxes.length <= 0) return;
    boxes[Math.floor(Math.random() * boxes.length)].parentElement.style.display = 'flex';
  }

  /**
   * @param {Element} hotspot
   * @returns {string | boolean}
   */
  function getHotspotProductHandle(hotspot, mobile = false) {
    if (mobile) {
      const mobile_handle = hotspot.querySelector('.hotspot-content').id;
      if (!mobile_handle) return false;
      return mobile_handle;
    }
    if (hotspot.parentElement.getAttribute('href') != '#') {
      const res = /products\/(.*$)/.exec(hotspot.parentElement.href)[1];
      hotspot.parentElement.style = 'cursor: pointer';
      return res;
    }
    return false;
  }

  /**
   * @param {Element} hotspot
   */
  function removeHotspotLink(hotspot) {
    hotspot.parentElement.removeAttribute('href');
  }

  /**
   * @param {Element} active
   * @param {Map<Element, Element>} hotspotAssociation
   */
  function hideAllBoxes(hotspotAssociation, active) {
    hotspotAssociation.forEach((box, hotspot) => {
      if (box != active) box.parentElement.style.display = 'none';
    });
  }

  /**
   * @param {Element[]} hotspotsParam
   * @param {Element[]} boxesParam
   */
  function associateHotspotWithBox(hotspotsParam, boxesParam) {
    const hotspotProducts = new Map();
    const boxes = Array.from(boxesParam);
    hotspotsParam.forEach((hotspot) => {
      const handle = getHotspotProductHandle(hotspot);
      if (!handle) return;
      const match = boxes.filter((box) => box.classList.contains(`product-${handle}`))[0];
      hotspotProducts.set(hotspot, match);
    });
    hotspotProducts.forEach((box, hotspot) => {
      removeHotspotLink(hotspot);
      hotspot.addEventListener('click', () => {
        box.parentElement.style.display = 'flex';
        hideAllBoxes(hotspotProducts, box);
      });
    });
  }

  /**
   * @param {Element[]} mobileHotspots
   * @param {Element[]} boxes
   */
  function associateMobileHotspotsWithBox(mobileHotspots, boxes) {
    const hotspotProducts = new Map();
    const boxesArray = Array.from(boxes);
    mobileHotspots.forEach((hotspot) => {
      const handle = getHotspotProductHandle(hotspot, true);
      if (!handle) return;
      const match = boxesArray.filter((box) => box.classList.contains(`product-${handle}`))[0];
      hotspotProducts.set(hotspot, match);
    });
    hotspotProducts.forEach((box, hotspot) => {
      hotspot.addEventListener('click', () => {
        box.parentElement.style.display = 'flex';
        hideAllBoxes(hotspotProducts, box);
      });
    });
  }

  const hotspotList = getAllHotspots();
  const boxList = getAllProductBoxes();
  const mobileHotspotList = getAllMobileHotspots();
  associateHotspotWithBox(hotspotList, boxList);
  associateMobileHotspotsWithBox(mobileHotspotList, boxList);
  showRandom();
})(product_hotspots_container);
