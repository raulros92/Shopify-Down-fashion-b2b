(function () {
  const inputField = document.getElementById('agentSearchText');
  const tableContainer = document.getElementById('agent-companies');
  const searchBtn = document.getElementById('agentSearchButton');
  
  const modalClientsTable = document.getElementById('upng-table-client-carts');
  let modalTableBody;
  let agentCartsEnabled = false;
  if(modalClientsTable!=null){
    agentCartsEnabled = true;
    modalTableBody = modalClientsTable.querySelector('tbody');
  }
  
  // URLs de las aplicaciones.
  const BASE_URL = window.Shopify.routes.root + 'apps/upango_agentes';
  const BASE_CART_URL = window.Shopify.routes.root + 'apps/upango-control-cestas';
  if (!inputField || !tableContainer || !searchBtn) {
    return console.error('AgentCompanies: Something went wrong trying to get inputField or tableContainer');
  }
  const table = tableContainer.querySelector('#agent-companies-table tbody');
  // Id del usuario;
  if (!__st || !__st.cid) {
    return console.error('No se encontró un id de usuario');
  }
  const userid = __st.cid;

  if (!document.getElementById('current_company_id')) {
    return console.error('AgentCompanies: Something went wrong trying to get the Company ID');
  }

  const currentCompanyId = document.getElementById('current_company_id').value;

  /**
   * @param {string[]} companiesExternalIds
   * @returns {Promise<null|Map<string, any>>}
   */
  async function getCompaniesCarts(companiesExternalIds) {
    const req = await fetch(BASE_CART_URL + '/getCartsByCompanies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companies: companiesExternalIds }),
    });
    if (!req.ok) {
      console.error('Algo fue mal intentando obtener los datos de carritos para una company');
      return null;
    }
    const res = await req.json();
    const result = new Map(Object.entries(res.data));
    console.log(result);
    return result;
  }

  /**
   * @param {string} searchQuery
   * @returns {Promise<[{externalId: string, id: string, name: string, metafield: {key:string, value: string}}]>}
   */
  async function getCompanies(searchQuery) {
    showLoadingSelectCompany(true);
    const request = await fetch(BASE_URL + '/agents/search_agent_companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        agentid: userid,
        searchQuery: searchQuery,
      }),
    });
    const result = await request.json();
    showLoadingSelectCompany(false);
    return result;
  }

  function showLoadingSelectCompany(show) {
    const agentCompaniesDiv = document.getElementById('agent-companies');
    const loadingElement = agentCompaniesDiv.querySelector('#agent-companies .loading-overlay__spinner');
    const buttons = agentCompaniesDiv.querySelectorAll('button');

    if (show) {
      loadingElement.classList.remove('hidden');
      //Desahabilitamos botones
      buttons.forEach((button) => {
        button.setAttribute('aria-disabled', true);
      });
    } else {
      loadingElement.classList.add('hidden');
      //Habilitamos botones
      buttons.forEach((button) => {
        button.removeAttribute('aria-disabled');
      });
    }
  }

  function selectCompany(companyId) {
    (async () => {
      showLoadingSelectCompany(true);

      console.log('selectCompany');
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId,
          shop: Shopify.shop,
          customer: __st.cid,
        }),
      };

      const response = await fetch(BASE_URL + '/agents/select_company', fetchOptions);
      const jsonData = await response.json();
      console.log('jsonData: ' + jsonData);

      const assigned = jsonData.data.assigned;
      console.log('assigned', assigned);

      if (assigned) {
        window.location = accountUrl;
      } else {
        showLoadingSelectCompany(false);
      }
    })();
  }

  /**
   * @param {[{ customer_id: string, customer_name: string, id: number, product_id: string, product_name: string, quantity: number,
   * timestamp: string, unit_price: number, variant_id: string, variant_name: string }]} lineItems
   * @returns {number}
   */
  function calculateCartTotal(lineItems) {
    console.log(lineItems);
    let result = 0;
    lineItems.forEach((item) => {
      result += (item.unit_price / 100) * item.quantity;
    });
    return result;
  }

  /**
   * @param {[{ customer_id: string, customer_name: string, id: number, product_id: string, product_name: string, quantity: number,
   * timestamp: string, unit_price: number, variant_id: string, variant_name: string }]} lineItems
   * @returns {number}
   */
  function calculateCartItemCount(lineItems) {
    let result = 0;
    lineItems.forEach((item) => {
      result += item.quantity;
    });
    return result;
  }

  /**
   *
   * @param {[{ customer_id: string, customer_name: string, id: number, product_id: string, product_name: string, quantity: number,
   * timestamp: string, unit_price: number, variant_id: string, variant_name: string }]} lineItems
   * @returns {HTMLDivElement}
   */
  function paintCartItems(lineItems) {
    // Devuelve un string de HTML
    let table = `
    <table>
      <thead>
        <tr>
          <th>${agents_translations.product}</th>
          <th>${agents_translations.variant}</th>
          <th>${agents_translations.quantity}</th>
          <th>${agents_translations.unit_price}</th>
        </tr>
      </thead>
      <tbody>
    `;
    lineItems.forEach((item) => {
      table += `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.variant_name}</td>
        <td>${item.quantity}</td>
        <td style="font-size: larger !important;">${item.unit_price / 100}€</td>
      </tr>
      `;
    });
    table += `</tbody>
      </table>
    </div>`;
    const result = document.createElement('div');
    result.innerHTML = table;
    result.style.padding = '1em';
    return result;
  }

  /**
   * Mapa que asocia ID de cliente con datos del carrito.
   * @param {any} companyData
   */
  function paintModalTable(companyData) {
    modalTableBody.innerHTML = '';
    const mappedData = new Map(Object.entries(companyData));
    console.log(mappedData);
    for (const [customerId, cartLines] of mappedData) {
      if (cartLines.length == 0) continue;
      const clientName = cartLines[0].customer_name;
      const itemsContainer = paintCartItems(cartLines);
      modalTableBody.innerHTML += `
      <tr>
        <td>${clientName}</td>
        <td>${calculateCartTotal(cartLines)}€</td>
        <td>${calculateCartItemCount(cartLines)}</td>
        <td><button class="button ${
          mappedData.size == 1 ? 'cart-button-hide' : 'cart-button-show'
        }" id="cart-${customerId}">${
        mappedData.size == 1 ? agents_translations.hide_cart : agents_translations.show_cart
      }</button></td>
      </tr>
      <tr id="details-${customerId}" style="${mappedData.size == 1 ? 'display: table-row;' : 'display: none;'}">
        <td colspan="4">
        ${itemsContainer.outerHTML}
        </td>
      </tr>`;
    }

    for (const [customerId, cartLines] of mappedData) {
      if (cartLines.length == 0) continue;
      
      const toggleBtn = modalTableBody.querySelector(`#cart-${customerId}`);
      const detailsRow = modalTableBody.querySelector(`#details-${customerId}`);
      toggleBtn.addEventListener('click', () => {
        console.log('Click!');
        const shown = detailsRow.style.display;
        console.log(shown);
        if (shown == 'none') {
          detailsRow.style.display = 'table-row';
          toggleBtn.innerHTML = agents_translations.hide_cart;
          toggleBtn.classList.remove('cart-button-show');
          toggleBtn.classList.add('cart-button-hide');
        } else {
          detailsRow.style.display = 'none';
          toggleBtn.innerHTML = agents_translations.show_cart;
          toggleBtn.classList.add('cart-button-show');
          toggleBtn.classList.remove('cart-button-hide');
        }
      });
    }
  }

  /**
   * @param {[{externalId: string, id: string, name: string, metafield: {key:string, value: string}}]} data
   * @param {Map<string, any>} cartData
   */
  function paintTableData(data, cartData = null) {
    table.innerHTML = '';
    console.log(data);
    document.getElementById('results-messages').style.display = 'block';
    if (data.length <= 0 || !data) {
      document.getElementById('message_no_results').style.display = 'inline';
      document.getElementById('message_results').style.display = 'none';
      return;
    }
    for (let i = 0; i < data.length; i++) {
      const company = data[i];
      const row = document.createElement('tr');
      const externalIdCell = document.createElement('td');
      const nameCell = document.createElement('td');
      
      // Crear el botón.
      const buttonCell = document.createElement('td');
      buttonCell.classList.add('actions-cell');
      externalIdCell.textContent = company.externalId;
      nameCell.textContent = company.name;
      const button = document.createElement('button');
      button.classList.add('seleccionar-cliente');
      button.classList.add('button');
      button.dataset.id = company.id;
      button.textContent = agents_translations.select;
      if (!currentCompanyId || !company.id.toString().includes(currentCompanyId)) {
        button.addEventListener('click', () => {
          const companyId = button.dataset.id;
          selectCompany(companyId);
        });
      } else {
        button.setAttribute('disabled', 'disabled');
      }
      buttonCell.appendChild(button);
      row.appendChild(externalIdCell);
      row.appendChild(nameCell);

      const cartCell = document.createElement('td');
      const cartButtonCell = document.createElement('td');

      if (cartData && agentCartsEnabled && cartData.get(company.externalId) && Object.keys(cartData.get(company.externalId)).length > 0) {
        const data = cartData.get(company.externalId);
        // cartCell.innerHTML += `${agentes_cart_icon ? `<img src="${agentes_cart_icon}" class="agent-cart-icon">` : ''
        //   } ${
        //   Object.keys(data).length == 1
        //     ? '(' + calculateCartTotal(new Map(Object.entries(data)).entries().next().value[1]) + '€)'
        //     : ''
        // }`;
        let importeTotal = 0;
        let map = new Map(Object.entries(data));

        for (let entry of map.entries()) {
          importeTotal += calculateCartTotal(entry[1]);
        }

        cartCell.innerHTML += `${
          importeTotal + '€'
        }`;

        cartButtonCell.innerHTML += `<modal-opener class="no-js-hidden" data-modal="#upng-agente-clientes-modal">
          <button class="button"><span>${agents_translations.show_carts}</span></button>
        </modal-opener>`;

        const modalOpenerBtn = cartButtonCell.querySelector('button');
        const icon = cartCell.querySelector('img');
        // modalOpenerBtn.addEventListener('mouseenter', () => (icon.style.filter = 'invert(0)'));
        // modalOpenerBtn.addEventListener('mouseleave', () => (icon.style.filter = 'invert(1)'));
        modalOpenerBtn.addEventListener('click', () => paintModalTable(cartData.get(company.externalId)));
        
      } else {
        if (agent_carts_status) {
          cartButtonCell.innerHTML = '';

          if (agentes_cart_icon_empty) cartCell.innerHTML = `<img src="${agentes_cart_icon_empty}" class="agent-cart-icon">`;
          else cartCell.innerHTML = '';
        }
      }
      row.append(cartCell);
      row.append(cartButtonCell);
      row.appendChild(buttonCell);
      table.appendChild(row);
    }
    document.querySelector('#agent-companies-table').style.display = 'table';
  }

  document.querySelector('#customer-search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    document.getElementById('results-messages').style.display = 'none';
    document.getElementById('message_no_results').style.display = 'none';
    document.getElementById('message_results').style.display = 'none';
    const searchData = inputField.value;
    console.log('Searching agentes for: ' + searchData);
    if (!searchData) return console.error('El usuario no ha introducido nada');
    getCompanies(searchData).then((result) => {
      const idList = [];
      result.forEach((data) => idList.push(data.externalId));
      (async () => {
        // Obtenemos los carritos para todas las companies encontradas.
        if (agent_carts_status) {
          const cartData = await getCompaniesCarts(idList);
          paintTableData(result, cartData);
        } else {
          paintTableData(result, null);
        }
      })();
    });
  });
})();
