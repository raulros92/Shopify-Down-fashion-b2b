console.log('Compare Checbox Script Outer');
(function () {
  console.log('Comparator Checkbox Loaded');
  const main = () => {
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    checkboxes.forEach((checkbox) => (checkbox.style.display = 'grid'));
    const compareBtnMenu = document.getElementById('compare-button-container');
    const drawerOpener = document.getElementById('upngDrawerOpener');

    const showCompareBtn = (amount) => {
      compareBtnMenu.style.display = 'flex';
      const baseText = comparador_productos_traducciones.pill.text;
      const comparetxt = compareBtnMenu.querySelector('.compare-n-products-text');
      comparetxt.innerHTML = `${amount} ${baseText}`;
    };

    const showDrawerOpener = () => {
      drawerOpener.style.display = 'inline-flex';
    };

    /**
     * @param {string} productHandle
     * @returns {Promise<{ available: boolean, compare_at_price: boolean, compare_at_price_max: number, compare_at_price_min: number, compare_at_price_varies: number, created_at: string, description: string,
     * featured_image: string, handle: string, id: number, images: string[], media: any[], options: any[], price: number, price_max: number, price_min: number, price_varies: boolean,
     * published_at: string, requires_selling_plan: boolean, selling_plan_groups: any[], tags: any[], title: string, type: string, url: string, variants: any[], vendor: string } | null>}
     */
    const getProductInfo = async (productHandle) => {
      const req = await fetch(window.Shopify.routes.root + `products/${productHandle}.js`);
      if (!req.ok) return null;
      const res = await req.json();
      return res;
    };

    /**
     * @returns { [{ description: string, handle: string, options: any[], price: number, title: string, vendor: string }] }
     */
    const getSavedData = () => {
      const sessionStorageData = JSON.parse(sessionStorage.getItem('compareItems'));
      return sessionStorageData;
    };

    const isProductInStorage = (productHandle) => {
      const savedData = getSavedData();
      if (!savedData) return false;
      let res = false;
      for (let i = 0; i < savedData.length; i++) {
        const data = savedData[i];
        if (data.handle == productHandle) {
          res = true;
          break;
        }
      }
      return res;
    };

    const disableCheckboxes = (addClass = false) => {
      checkboxes.forEach((checkbox) => {
        const handle = checkbox.getAttribute('product-target');
        if (!isProductInStorage(handle)) {
          if (addClass) checkbox.style = 'background-color: #b4b4b4;';
          checkbox.disabled = true;
        }
      });
    };

    const enableCheckboxes = () => {
      checkboxes.forEach((checkbox) => {
        checkbox.disabled = false;
        checkbox.style = '';
      });
    };

    /**
     * @param {string} productHandle
     */
    const handleCheckboxChecked = async (productHandle, metafields) => {
      const sessionStorageData = getSavedData();
      console.log(sessionStorageData);
      if (sessionStorageData) {
        let productFoundIndex = null;
        for (let i = 0; i < sessionStorageData.length; i++) {
          const data = sessionStorageData[i];
          if (data.handle == productHandle) {
            productFoundIndex = i;
            break;
          }
        }
        if (productFoundIndex != null) {
          console.error('Product was found in SessionStorage');
          sessionStorageData.splice(productFoundIndex, 1);
          if (sessionStorageData.length == 0) {
            sessionStorage.removeItem('compareItems');
          } else {
            sessionStorage.setItem('compareItems', JSON.stringify(sessionStorageData));
          }
          if (sessionStorageData.length >= MAX_PRODUCTOS_COMPARADOR) {
            console.log('Disabling all checkboxes...');
            disableCheckboxes(true);
          }
          return;
        }
        if (sessionStorageData.length >= MAX_PRODUCTOS_COMPARADOR) {
          disableCheckboxes(true);
          console.error(`No puedes añadir más de ${MAX_PRODUCTOS_COMPARADOR} elementos`);
          return;
        }
      }
      const productData = await getProductInfo(productHandle);
      console.log(productData);
      const result = {
        title: productData.title,
        handle: productHandle,
        vendor: productData.vendor,
        price: productData.price,
        description: productData.description,
        options: productData.options,
        metafields: metafields,
        image: productData.featured_image,
        id: productData.id,
      };
      if (sessionStorageData) {
        sessionStorageData.push(result);
        sessionStorage.setItem('compareItems', JSON.stringify(sessionStorageData));
        if (sessionStorageData.length >= MAX_PRODUCTOS_COMPARADOR) {
          disableCheckboxes(true);
        }
        return;
      }
      sessionStorage.setItem('compareItems', JSON.stringify([result]));
    };
    const sessionData = getSavedData();
    if (sessionData && sessionData.length >= MAX_PRODUCTOS_COMPARADOR) {
      disableCheckboxes(true);
    }

    checkboxes.forEach((checkbox) => {
      const target = checkbox.getAttribute('product-target');
      const metafieldDataAttribute = checkbox.getAttribute('product-metafields').trim();
      let metafieldData = [];
      if (metafieldDataAttribute) {
        metafieldData = metafieldDataAttribute.substring(0, metafieldDataAttribute.length - 1).split(',');
      }
      if (!target) return;
      if (isProductInStorage(target) && getSavedData().length <= MAX_PRODUCTOS_COMPARADOR) {
        checkbox.checked = true;
      }
      if (getSavedData() && getSavedData().length >= 2) {
        if (compareBtnMenu) showCompareBtn(getSavedData().length);
        if (drawerOpener) showDrawerOpener();
      }
      checkbox.addEventListener('change', () => {
        console.log('Compare Checkbox Changed');
        if (checkbox.checked == false) {
          enableCheckboxes();
        }
        if (checkbox.checked == true && getSavedData() && getSavedData().length >= MAX_PRODUCTOS_COMPARADOR) {
          // Si ya hay MAX_PRODUCTOS_COMPARADOR elemento guardados, deshacemos este checkbox.
          alert(`No puedes añadir más de ${MAX_PRODUCTOS_COMPARADOR} Elementos`);
          checkbox.checked = false;
          return;
        }
        checkbox.disabled = true;
        disableCheckboxes();
        handleCheckboxChecked(target, metafieldData).then(() => {
          checkbox.disabled = false;
          if (!getSavedData() || getSavedData().length < MAX_PRODUCTOS_COMPARADOR) enableCheckboxes();
          if (getSavedData() && getSavedData().length >= 2) {
            if (compareBtnMenu) showCompareBtn(getSavedData().length);
            if (drawerOpener) showDrawerOpener();
          } else {
            if (compareBtnMenu) compareBtnMenu.style.display = 'none';
            if (drawerOpener) drawerOpener.style.display = 'none';
          }
        });
      });
    });
    if (getSavedData() && getSavedData().length >= MAX_PRODUCTOS_COMPARADOR) {
      disableCheckboxes(true);
    }
  };
  const hideAll = () => {
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    const compareBtnMenu = document.getElementById('compare-button-container');
    const drawerOpener = document.getElementById('upngDrawerOpener');
    checkboxes.forEach((checkbox) => (checkbox.style.display = 'none'));
    if (compareBtnMenu) compareBtnMenu.style.display = 'none';
    if (drawerOpener) drawerOpener.style.display = 'none';
  };
  const comparatorSwitch = document.getElementById('comparador-switch');
  comparatorSwitch.addEventListener('change', () => {
    if (comparatorSwitch.checked) main();
    else hideAll();
  });
  if (comparatorSwitch.checked) main();
  const target = document.querySelector('#ProductGridContainer');
  const observer = new MutationObserver((mutations) => {
    if (comparatorSwitch.checked) main();
    else hideAll();
  });
  observer.observe(target, { childList: true });
})();
