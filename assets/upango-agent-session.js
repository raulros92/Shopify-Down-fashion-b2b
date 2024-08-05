(function () {
    function closeAgentCustomerSession() {
        (async () => {            
            console.log("closeAgentCustomerSession");
            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            const response = await fetch('/apps/upango_royalbio/agents/close_agent_customer_session', fetchOptions);
            const jsonData = await response.json();
            console.log("jsonData: " + jsonData);

            const ok = jsonData.data.ok;

            if(ok) {
                window.location = "https://b2b-royal-bio.myshopify.com/pages/mi-cuenta";
            }

        })();
    }
    
    document
        .querySelector("#close-customer-agent-session")
        .addEventListener("click", closeAgentCustomerSession);

})();