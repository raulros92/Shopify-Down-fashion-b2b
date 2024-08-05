(function () {

    function getCompanyBillingAddress() {
        (async () => {
            var bodyData = JSON.stringify({
                'companyId':companyId,
                'shop':Shopify.shop
            });

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: bodyData
            };

            const response = await fetch('/apps/upango-b2b/companies/billing-address/', fetchOptions);
            if(response.ok){
                const jsonData = await response.json();
                console.log("mis_datos jsonData: " + jsonData);
                showBillingAddress(jsonData.data.billingAddress);
            }
        })();
    }

    function showBillingAddress(billingAddress) {
        console.log('billingAddress',billingAddress);
        showBillingAddressField('address1',billingAddress.address1);
        showBillingAddressField('address2',billingAddress.address2);
        showBillingAddressField('zip',billingAddress.zip);
        showBillingAddressField('city',billingAddress.city);
        showBillingAddressField('countryname',billingAddress.countryname);
        showBillingAddressField('phone',billingAddress.phone);
    }

    function showBillingAddressField(fieldName,value) {

        if(value != null && value != ''){
            const li = document.getElementById('li-billingaddress-'+fieldName);
            const span = document.getElementById('billingaddress-'+fieldName);

            if(span!=null){
                span.innerHTML = value;
            }
            if(li!=null){
                li.style.display = 'block';
            }
        }
    }

    //Busqueda inicial
    document.addEventListener("DOMContentLoaded", function(){
        getCompanyBillingAddress();
    });

})();