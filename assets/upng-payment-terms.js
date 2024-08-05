(function () {
  async function sendChangePaymentTermsRequest(locationId, b2bPayment, companyId) {
    console.log(`Attempting to change payment terms for locationId: ${locationId}, to b2bPayment: ${b2bPayment}`);
    const request = await fetch('/apps/upango-b2b/companies/change-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        companyLocationId: locationId,
        b2bPayment: b2bPayment,
        companyId: companyId,
      }),
    });
    return request;
  }

  console.log('Payment Terms Script Loaded');
  const checkoutBtn = document.querySelector('#checkout');
  if (!checkoutBtn) return console.error('Checkout Button Not Found!!');
  const radioButtons = document.querySelectorAll('input[name="attributes\\[changePayment\\]"]');
  if (radioButtons.length < 2) return console.error('Could not find at least 2 radio buttons');
  checkoutBtn.disabled = 'true';

  radioButtons.forEach((radio) => {
    radio.addEventListener('change', function () {
      checkoutBtn.disabled = true;
      const paymentOption = this.id;
      const locationId = radio.getAttribute('location-id');
      const companyId = radio.getAttribute('company-id');
      if (!locationId) return console.error('No se ha encontrado una location id');
      if (!companyId) return console.error('No se ha encontrado una company id');
      console.log(`New payment Option is: ${paymentOption}`);
      let b2bPayment = false;
      if (this.id == 'changePaymentToB2B') b2bPayment = true;
      sendChangePaymentTermsRequest(locationId, b2bPayment, companyId).then((res) => {
        if (res.ok) checkoutBtn.disabled = false;
      });
    });
  });
})();
