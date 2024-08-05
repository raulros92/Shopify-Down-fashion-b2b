reChecked=false;
(function () {
    function applyRE(event) {
        (async () => {
            if(reChecked){
                return;
            }
            event.preventDefault();
            const cartId = getCookie('cart');
            console.log('cartId:',cartId);
            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    'cartId':cartId,
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            const response = await fetch('/apps/upango_royalbio/re/apply-re', fetchOptions);
            const jsonData = await response.json();
            console.log("apply-re jsonData: " + jsonData);

            const applyReResult = jsonData.ok;
            
            if(!applyReResult){
                console.log('NO OK');
                reChecked=false;
            } else {
                console.log('OK');
                reChecked = true;
                document.getElementById("checkout").click();
            }
            
        })();
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }

    function addRE(event) {
        (async () => {
            if(reChecked){
                return;
            }
            event.preventDefault();

            const reVariantIdInput = document.getElementById('re_variant_id');
            const quantity = 1;
            const reVariantId= reVariantIdInput.value;
            const addToBasketData = { 'items' :[{"id":reVariantId,"quantity":quantity}]};
            //updateBasketData.updates[variantId]=quantity; 
            
            await fetch(window.Shopify.routes.root + 'cart/add.js' , { method: 'POST' , headers: { 'Content-Type' : 'application/json' }, body: JSON.stringify(addToBasketData) })
                .then(response=> response.json()).then(data => {
                    console.log("data: "+data);
                    console.log('OK');
                    reChecked = true;
                    document.getElementById("checkout").click();
                }
            )
            .catch((error) => {
                console.error('Error:', error);
                reChecked=false;
            });
        })();
    }

    document
        .querySelector("#cart")
        .addEventListener("submit", addRE);

})();