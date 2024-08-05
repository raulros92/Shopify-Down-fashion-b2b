(function () {
  const main = () => {
    console.log("UpangoFavoritos");
    // Este mapa asocia un product-id con un array de todos los botones que hacen referencia a ese product id.
    const buttonMapIds = new Map();

    function toggleFavButtonsForProductId(productid, jsonData) {
      console.log(buttonMapIds);
      const buttons = buttonMapIds.get(productid);
      if (!buttons)
        return console.error("Botón/Id de Producto no encontrado en el Mapa");
      const activo = jsonData.data.favoritos.activo;
      buttons.forEach((button) => {
        if (activo == 1) {
          console.log("Activo is 1");
          button.classList.remove("btn-fav-inactivo");
          button.classList.add("btn-fav-activo");
        } else {
          console.log("Activo is else");
          button.classList.remove("btn-fav-activo");
          button.classList.add("btn-fav-inactivo");
        }
      });
    }

    async function addRemoveFavoritos(product, button) {
      console.log("addRemoveFavoritos");

      var bodyData = JSON.stringify({
        shop: Shopify.shop,
        customerid: __st.cid,
        productid: product,
      });

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyData,
      };

      const response = await fetch(
        "/apps/upango-favoritos/customers/favoritos/",
        fetchOptions
      );
      if (response.ok) {
        const jsonData = await response.json();
        console.log("resultado: " + JSON.stringify(jsonData));
        toggleFavButtonsForProductId(product, jsonData);
        /*if (jsonData.data.favoritos.activo == 1) {
        button.classList.remove('btn-fav-inactivo');
        button.classList.add('btn-fav-activo');
      } else {
        button.classList.remove('btn-fav-activo');
        button.classList.add('btn-fav-inactivo');
      }*/
      }
    }
    var btnAddRemoveFavoritos = document.querySelectorAll(
      ".btn-addremovefavoritos"
    );
    console.log(buttonMapIds);
    btnAddRemoveFavoritos.forEach(function (button) {
      const productId = button.getAttribute("data-productid");
      if (productId) {
        if (!buttonMapIds.get(productId)) {
          buttonMapIds.set(productId, [button]);
        } else {
          const buttonsArr = buttonMapIds.get(productId);
          buttonsArr.push(button);
          buttonMapIds.set(productId, buttonsArr);
        }
      }
      // Agrega un event listener al cambio de selección
      button.addEventListener("click", function () {
        var productId = this.getAttribute("data-productid");
        console.log("productId " + productId);
        addRemoveFavoritos(productId, button);
      });
    });
    console.log(buttonMapIds);
  };
  document.addEventListener("DOMContentLoaded", () => {
    main();
  });
  const target = document.querySelector("#ProductGridContainer");
  console.log(target);
  const observer = new MutationObserver((mutations) => main());
  observer.observe(target, { childList: true });
})();
