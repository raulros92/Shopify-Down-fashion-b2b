(function () {
  console.log('Upng Drawer Loaded');

  const drawerOpener = document.getElementById('upngDrawerOpener');
  const drawer = document.querySelector('upango-drawer.upngDrawer');
  const checkboxes = document.querySelectorAll('.compare-checkbox');

  // Textos traducidos.
  const deleteTranslated = document.getElementById('compare-drawer-delete-translated').innerHTML || 'Delete';

  const getSessionStorageData = () => {
    const data = sessionStorage.getItem('compareItems');
    return data ? JSON.parse(data) : [];
  };

  const enableCheckboxes = () => {
    checkboxes.forEach((checkbox) => {
      checkbox.style = '';
      checkbox.disabled = false;
    });
  };

  const getItemIndex = (handle) => {
    const data = getSessionStorageData();
    if (!data || data.length == 0) return null;
    let res = null;
    for (let i = 0; i < data.length; i++) {
      const product = data[i];
      if (product.handle == handle) {
        res = i;
        break;
      }
    }
    return res;
  };

  const changeCheckboxes = () => {
    const data = getSessionStorageData();
    checkboxes.forEach((checkbox) => {
      if (!data || data.length == 0) {
        checkbox.checked = false;
      } else {
        const target = checkbox.getAttribute('product-target');
        if (!target) return;
        if (getItemIndex(target) == null) checkbox.checked = false;
        else checkbox.checked = true;
      }
    });
  };

  if (getSessionStorageData().length == 0) {
    drawerOpener.style.display = 'none';
  }

  drawerOpener.addEventListener('click', () => {
    const data = getSessionStorageData();
    if (!data || data.length == 0) {
      console.error('Null Storage');
      return;
    }
    drawer.resetBody();
    drawer.open();
    data.forEach((item) => {
      const deleteAction = document.createElement('button');
      deleteAction.innerHTML = comparador_icon_remove || deleteTranslated;
      deleteAction.className = 'button button--tertiary compare-remove-button';
      deleteAction.type = 'button';
      deleteAction.ariaLabel = `${deleteTranslated} ${item.title}`;
      deleteAction.setAttribute('data-product-id', item.id);
      //deleteAction.style = 'text-decoration: none; color: inherit;';
      deleteAction.href = '#';
      deleteAction.addEventListener('click', () => {
        drawer.deleteProduct(item.handle);
        const index = getItemIndex(item.handle);
        if (index == null) return;
        const data = getSessionStorageData();
        data.splice(index, 1);
        enableCheckboxes();
        if (data.length <= 1) drawerOpener.style.display = 'none';
        if (data.length == 0) {
          sessionStorage.removeItem('compareItems');
          changeCheckboxes();
          return;
        }
        sessionStorage.setItem('compareItems', JSON.stringify(data));
        changeCheckboxes();
      });
      drawer.addProduct({
        image: item.image,
        title: item.title,
        vendor: item.vendor,
        deleteBtn: deleteAction,
        handle: item.handle,
      });
    });
  });
})();
