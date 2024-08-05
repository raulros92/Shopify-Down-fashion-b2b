(function () {
  const onUpdate = () => {
    console.log('Comparasion Modal Working!');

    const compareBtn = document.getElementById('compareModalBtn');
    const compareModalContainer = document.getElementById('compare-modal-container');
    const drawerCompareBtn = document.getElementById('upngDrawerOpener');

    // Los checkboxes y el botón de comparación.
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    const compareBtnMenu = document.getElementById('compare-button-container');

    // Traducciones
    const seeProductText = comparador_productos_traducciones.modal.see_product;
    const deleteProductText = comparador_productos_traducciones.modal.delete_product;
    const priceText = comparador_productos_traducciones.products.price;
    const descriptionText = comparador_productos_traducciones.products.description;

    // Obtiene datos de sessionStorage, en caso de que no existan devuelve un array vacío.
    const getStoredData = () => {
      const data = sessionStorage.getItem('compareItems');
      if (!data) return [];
      return JSON.parse(data);
    };

    /**
     * @param {Map<any, any>[]} data
     */
    const getAllNonDefaultKeys = (data) => {
      const res = [];
      const defaultKeys = ['title', 'description', 'price', 'options', 'handle', 'vendor', 'image'];
      data.forEach((map) => {
        for (const [key, value] of map) {
          if (defaultKeys.indexOf(key) != -1) continue;
          if (res.indexOf(key) == -1) res.push(key);
        }
      });
      return res;
    };

    const getProductCheckbox = (handle) => {
      let res = null;
      for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const target = checkbox.getAttribute('product-target');
        if (!target) continue;
        if (target == handle) {
          res = checkbox;
          break;
        }
      }
      return res;
    };

    const enableCheckboxes = () => {
      checkboxes.forEach((checkbox) => {
        checkbox.disabled = false;
        checkbox.style = '';
      });
    };

    // Creo un array de mapas donde la clave son las opciones de cada producto.
    // Si un producto no posee una opción, esta será representada como un
    // espacio en blanco.
    /**
     * @param {any[]} data
     */
    const createProductsMap = (data) => {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        const mapProduct = new Map();
        const product = data[i];
        mapProduct.set('title', product.title);
        mapProduct.set('description', product.description);
        mapProduct.set('price', product.price);
        mapProduct.set('handle', product.handle);
        mapProduct.set('vendor', product.vendor);
        mapProduct.set('image', product.image);
        if (product.options.length > 0) {
          product.options.forEach((option) => {
            mapProduct.set(option.name, option.values.join(', '));
          });
        }
        if (product.metafields.length > 0) {
          product.metafields.forEach((metafield) => {
            const vals = metafield.split(':');
            mapProduct.set(vals[0], vals[1]);
          });
        }
        res.push(mapProduct);
      }
      return res;
    };

    // Se encarga de generar las columnas de cada producto.
    /**
     * @param {Map<any, any>[]} dataArray
     * @returns {HTMLDivElement}
     */
    const generateRow = (dataArray, key) => {
      const row = document.createElement('tr');
      row.className = 'compare-row';
      for (let i = 0; i < dataArray.length; i++) {
        const productMap = dataArray[i];
        switch (key) {
          case 'image':
            row.innerHTML += `
            ${i == 0 ? '<th class="comparador-header"></th>' : ''}<td class="compare-col"><img src="${productMap.get(
              key
            )}" ${productMap.get('title') ? `alt="${productMap.get('title')}"` : ''}></td>
            `;
            break;
          case 'title':
            row.innerHTML += `
            ${
              i == 0 ? `<th class="comparador-header">${comparador_productos_traducciones.products.name}</th>` : ''
            }<td class="compare-col"><p>${productMap.get(key)}</p></td>
            `;
            break;
          case 'price':
            row.innerHTML += `
            ${
              i == 0 ? `<th class="comparador-header">${comparador_productos_traducciones.products.price}</th>` : ''
            }<td class="compare-col"><p>${productMap.get(key)}€</p></td>
            `;
            break;
          case 'description':
            row.innerHTML += `
            ${
              i == 0
                ? `<th class="comparador-header">${comparador_productos_traducciones.products.description}</th>`
                : ''
            }<td class="compare-col"><p>${productMap.get(key)}</p></td>
            `;
            break;
          default:
            if (key == 'Title') break;
            if (typeof productMap.get(key) == 'undefined') {
              row.innerHTML += `${
                i == 0 ? `<th class="comparador-header">${key}</th>` : ''
              }<td class="compare-col"><p>N/A</p></td>`;
              break;
            }
            row.innerHTML += `
            ${i == 0 ? `<th class="comparador-header">${key}</th>` : ''}<td class="compare-col"><p>${productMap.get(
              key
            )}</p></td>
            `;
            break;
        }
      }
      return row;
    };

    const deleteProduct = (handle) => {
      const data = getStoredData();
      if (data.length == 0) return;
      let deleteIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.handle == handle) {
          deleteIndex = i;
          break;
        }
      }
      if (deleteIndex != -1) {
        data.splice(deleteIndex, 1);
        sessionStorage.setItem('compareItems', JSON.stringify(data));
        const checkbox = getProductCheckbox(handle);
        if (checkbox) {
          checkbox.checked = false;
        }
        if (drawerCompareBtn) {
          if (data.length <= 1) drawerCompareBtn.style.display = 'none';
          enableCheckboxes();
        }
        if (compareBtn) {
          const baseText = comparador_productos_traducciones.pill.text;
          const comparetxt = compareBtnMenu.querySelector('.compare-n-products-text');
          comparetxt.innerHTML = `${data.length} ${baseText}`;
          if (data.length <= 1) compareBtnMenu.style.display = 'none';
          enableCheckboxes();
        }
      }
    };

    const generateButtonsRow = (dataArray) => {
      const row = document.createElement('div');
      row.className = 'compare-row';
      for (let i = 0; i < dataArray.length; i++) {
        const productMap = dataArray[i];
        const col = document.createElement('div');
        col.className = 'compare-col';
        const productLink = document.createElement('a');
        productLink.href = window.Shopify.routes.root + `products/${productMap.get('handle')}`;
        productLink.className = 'button';
        productLink.innerHTML = seeProductText;
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = deleteProductText;
        deleteBtn.classList.add('button', 'button--secondary');
        col.append(productLink);
        col.innerHTML += '<br>';
        deleteBtn.addEventListener('click', () => {
          const handle = productMap.get('handle');
          deleteProduct(handle);
          enableCheckboxes();
          main();
        });
        col.append(deleteBtn);
        row.append(col);
      }
      return row;
    };

    const main = () => {
      compareModalContainer.innerHTML = '';
      const data = getStoredData();
      const productMaps = createProductsMap(data);
      console.log(productMaps);
      const keys = getAllNonDefaultKeys(productMaps);
      const rows = [];
      rows.push(generateRow(productMaps, 'image'));
      rows.push(generateRow(productMaps, 'title'));
      rows.push(generateRow(productMaps, 'price'));
      rows.push(generateRow(productMaps, 'description'));
      keys.forEach((key) => {
        rows.push(generateRow(productMaps, key));
      });
      rows.push(generateButtonsRow(productMaps));
      rows.forEach((row) => {
        compareModalContainer.append(row);
      });
    };
    if (drawerCompareBtn) {
      console.log(drawerCompareBtn);
      drawerCompareBtn.addEventListener('click', () => {
        console.log('Click!');
        main();
      });
    }
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        main();
      });
    }
  };
  onUpdate();
  const target = document.querySelector('#ProductGridContainer');
  console.log(target);
  const observer = new MutationObserver((mutations) => onUpdate());
  observer.observe(target, { childList: true });
})();
