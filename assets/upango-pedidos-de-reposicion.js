(function () {
    document.addEventListener('DOMContentLoaded', function() {
        var variantSelectors = document.querySelectorAll('.variant-selector');
        variantSelectors.forEach(function(selector) {
            // Agrega un event listener al cambio de selección
            selector.addEventListener('change', function() {
                var selectedVariantId = this.value; // Obtiene el ID de la variante seleccionada
                var productId = this.dataset.productid;
            
                showVariantPrice(selectedVariantId,productId);
                showVariantStock(selectedVariantId,productId);
            
                refreshTotal(productId);
            });
        });
    
        var addToBasketButtons = document.querySelectorAll('.add-variant-to-basket');

        addToBasketButtons.forEach((button) => {
            button.addEventListener('click', function() {
                var productId = this.getAttribute('data-productid');
                var radioButtonName = 'variant-options-' + productId;
                var radioButton = document.querySelector('input[name="' + radioButtonName + '"]:checked');
            
                if (radioButton) {
                    var quantity = document.getElementById('quantity-'+productId);
                
                    var selectedVariantId = radioButton.value;
                    if(selectedVariantId!=null && selectedVariantId!=''){
                        addToCart(button,selectedVariantId,quantity.value);
                    } 
                }
            });
        });
    
        // Cuando cambie la cantidad
        var quantityInputs = document.querySelectorAll('.quantity__input');
        quantityInputs.forEach(function(quantityInput) {
            var productId = quantityInput.dataset.productid;
            quantityInput.addEventListener("change", function() {
                refreshTotal(productId);
            });
        });
  
    });
  
    function addToCart(button,variantId,quantity) {
        if(quantity==null || quantity<1){ quantity=1; }

        showLoading(button,true);
        //secciones a recargar
        var cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        var sections = cart.getSectionsToRender().map((section) => section.id);

        const addToBasketData = { 'items' :[{"id":variantId,"quantity":quantity}], 'sections' : sections };
        //updateBasketData.updates[variantId]=quantity; 
        
        fetch(window.Shopify.routes.root + 'cart/add.js' , { method: 'POST' , headers: { 'Content-Type' : 'application/json' }, body: JSON.stringify(addToBasketData) })
        //.then(response => response.json()).then(data => {
        .then((response) => response.json())
        .then((response) => {
            cart.renderContents(response);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty');
            showLoading(button,false);
        });
    }
  
    // Función para manejar el cambio en la cantidad
    function refreshTotal(productId) {
        var quantityElement = document.getElementById('quantity-'+productId);
        var quantity = parseInt(quantityElement.value);
    
        if(quantity>0){
            //Recuperar variante seleccionada
            var selectedVariantOption = document.querySelector('input[name="variant-options-'+productId+'"]:checked');
            if (selectedVariantOption) {
                var variantId = selectedVariantOption.value;
            
                //Recuperar precio de variante seleccionada
                var priceElement = document.getElementById('price-'+variantId);
                var price = priceElement.dataset.price;
            
                //Obtener total del precio
                var total = price * quantity;
            
                //Formato de moneda
                var totalWithMoneyFormat = formatMoney(total);
            
                //Actualizar valor en tabla
                var totalElement = document.getElementById("total-"+productId);
                totalElement.textContent = totalWithMoneyFormat;
            }
        }
    }
  
    function showVariantPrice(variantId,productId){
        // Oculta todos los precios de las variantes
        var allPrices = document.querySelectorAll('.price-'+productId);
        allPrices.forEach(function(price) {
            price.style.display = 'none';
        });
    
        // Muestra el precio de la variante seleccionada
        var selectedVariantPrice = document.getElementById('price-' + variantId);
        if (selectedVariantPrice) {
            selectedVariantPrice.style.display = 'block';
        }
    }
  
    function showVariantStock(variantId,productId){
        // Oculta el stock de las variantes
        var allStockInfo = document.querySelectorAll('.variant-stock-'+productId);
        allStockInfo.forEach(function(stockInfo) {
            stockInfo.style.display = 'none';
        });
    
        // Muestra el precio de la variante seleccionada
        var selectedVariantStockInfo = document.getElementById('stock-' + variantId);
        if (selectedVariantStockInfo) {
            selectedVariantStockInfo.style.display = 'block';
        }
    }
  
    function formatMoney(price){
        price = price/100;
        // Redondear el número a dos decimales
        var numeroRedondeado = parseFloat(price).toFixed(2);
    
        //Usamos coma como separador de decimales
        numeroRedondeado = numeroRedondeado.replace(".", ",");
    
        // Agregar el símbolo del euro al número redondeado
        let currency = '';
        if(Shopify.currency.active == "EUR"){
            currency = '€';
        }
        var resultado = numeroRedondeado + ' '+ currency;
    
        // Devolver el resultado formateado
        return resultado;
    }

})();