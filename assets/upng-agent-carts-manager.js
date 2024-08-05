async function restoreAgentCompanyCart(selectedCompanyId) {

    //Recuperar carrito para la company
    const cart = await getAgentCompanyCart(selectedCompanyId);

    //Vaciamos carrito
    console.log('vaciando carrito...');
    await clearCurrentCart();

    //Restaurar carrito guardado
    if (cart != null) {
        const itemsToCart = [];

        for (const lineItem of cart.lineItems) {
            console.log('restaurar item: ' + lineItem.variantId);
            itemsToCart.push({
                "id": lineItem.variantId,
                "quantity": lineItem.quantity
            });
        }

        const addToBasketData = { 'items': itemsToCart };

        await fetch(window.Shopify.routes.root + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addToBasketData) })
            .then(response => response.json()).then(data => {
                console.log("data: " + data);
                console.log('OK');
            })
            .catch((error) => {
                console.error('Error:', error);
                console.log('NO OK');
            });
    }
}

async function clearCurrentCart() {
    await fetch(window.Shopify.routes.root + 'cart/clear.js', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(response => response.json()).then(data => {
            console.log("data: " + data);
            console.log('OK');
        })
        .catch((error) => {
            console.error('Error:', error);
            console.log('NO OK');
        });
}

async function getAgentCompanyCart(companyId) {
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            'companyId': companyId,
            'shop': Shopify.shop,
            'customer': __st.cid
        })
    };

    const response = await fetch('/apps/upango_agentes/agents/get_saved_cart', fetchOptions);
    const jsonData = await response.json();

    console.log("jsonData: " + jsonData);
    const cart = jsonData.data.cart;
    return cart;
}

async function saveAgentCompanyCart(companyId) {
    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            'companyId': companyId,
            'shop': Shopify.shop,
            'customer': __st.cid,
            'items': agentCurrentCartItems,
        })
    };

    const response = await fetch('/apps/upango_agentes/agents/save_cart', fetchOptions);
    const jsonData = await response.json();
    console.log("jsonData: " + jsonData);
}

// const restoreButton = document.getElementById('restore-cart-button');
// if (restoreButton != null) {
//     restoreButton.addEventListener('click', function () {
//         restoreCart(agentCart);
//     });
// }

// document.getElementById('save-cart-button').addEventListener('click', function () {
//     saveCart();
// });