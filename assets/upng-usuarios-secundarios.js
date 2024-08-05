if (typeof usuarios_secundarios_container != 'undefined') {
  usuarios_secundarios_contador++;
  usuarios_secundarios_container = document.querySelectorAll('.usuarios-secundarios-container')[
    usuarios_secundarios_contador
  ];
  userID = usuarios_secundarios_container.querySelector('div[id]').id;
} else {
  var usuarios_secundarios_contador = 0;
  var usuarios_secundarios_container = document.querySelectorAll('.usuarios-secundarios-container')[
    usuarios_secundarios_contador
  ];
  var userID = usuarios_secundarios_container.querySelector('div[id]').id;
}

new (class UsuariosSecundarios {
  userID;
  // Por motivos de desarrollo voy a fijar la URL, pero lo ideal sería usar el app proxy de Shopify.
  #appURL = Shopify.routes.root + 'apps/usuarios-secundarios';
  #button = usuarios_secundarios_container.querySelector('.usuarios-secundarios-save-changes');
  #emailExp =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  constructor(userID) {
    this.userID = userID;
  }

  init = async (cursor = null, mode = null) => {
    // Voy a ocultar la tabla mientras verificamos que el usuario puede o no usarla.
    usuarios_secundarios_container.style.display = 'none';
    const userData = await this.#getUserData();
    if (!userData.isMainContact) {
      // Borramos la tabla si el usuario no puede accederla
      usuarios_secundarios_container.innerHTML = '';
      const errorMessage = document.createElement('div');
      showErrorMessages(errorMessage, ['Unable to get user data.']);
      usuarios_secundarios_container.parentElement.append(errorMessage);
      return console.error('El usuario no puede acceder la tabla');
    }
    // Vamos a almacenar aquí el estado actual de los usuarios de la tabla.
    let currentUserState = new Map();
    const companyID = userData.company.split('/')[userData.company.split('/').length - 1];
    this.#getCompanyData(companyID, cursor, mode).then((res) => {
      this.#displayDataInTable(res.data.companyData);
      usuarios_secundarios_container.querySelector('.usuarios-secundarios-previous-page').style.display = 'none';
      usuarios_secundarios_container.querySelector('.usuarios-secundarios-next-page').style.display = 'none';
      if (res.data.companyData.hasNextPage == true) {
        const nextPageBtn = usuarios_secundarios_container.querySelector('.usuarios-secundarios-next-page');
        nextPageBtn.style.display = 'inline-flex';
        nextPageBtn.addEventListener('click', () => {
          this.#destroyDataTable();
          nextPageBtn.replaceWith(nextPageBtn.cloneNode(true));
          return this.init(res.data.companyData.cursor);
        });
      }
      if (res.data.companyData.hasPreviousPage == true) {
        const previousPageBtn = usuarios_secundarios_container.querySelector('.usuarios-secundarios-previous-page');
        previousPageBtn.style.display = 'inline-flex';
        previousPageBtn.addEventListener('click', () => {
          this.#destroyDataTable();
          previousPageBtn.replaceWith(previousPageBtn.cloneNode(true));
          return this.init(res.data.companyData.startCursor, 'back');
        });
      }
      // Es importante que obtengamos los datos solo cuando la tabla se ha terminado de pintar.
      currentUserState = this.#getCurrentUserStates();
      // Si el usuario es un contacto principal de una empresa, mostramos la tabla.
      usuarios_secundarios_container.style.display = 'block';
    });
    // Una vez la tabla ha sido cargada, podemos añadir funcionalidad al botón de "guardar cambios"
    this.#button.addEventListener('click', () => {
      // Obtenemos los datos del usuario que queremos crear.
      const userData = this.#getNewUserData();
      const difference = this.#getUserStateDelta(currentUserState);
      // Si userData es false, significa que el usuario no quiere crear un usuario nuevo.
      if (!userData) {
        // En caso de que exista una diferencia, deberemos actualizar aquellos usuarios que hayan sido actualizados.
        if (difference) {
          // Pero esto voy a necesitar usar una ruta en el servidor dedicada a actualizar datos del servidor.
          this.#updateModifiedUsers(difference, companyID).then((res) => {
            // En caso de que la actualización sea completada satisfactoriamente, podemos actualizar los estados.
            if (res.status == 200) {
              currentUserState = this.#getCurrentUserStates();
              location.reload();
            }
          });
        }
        return console.error('Error: Empty User');
      }
      this.#createCompanyContact(userData, companyID).then(() => {
        // En caso de que exista una diferencia, deberemos actualizar aquellos usuarios que hayan sido actualizados.
        if (difference) {
          // Pero esto voy a necesitar usar una ruta en el servidor dedicada a actualizar datos del servidor.
          this.#updateModifiedUsers(difference, companyID).then((res) => {
            // En caso de que la actualización sea completada satisfactoriamente, podemos actualizar los estados.
            if (res.status == 200) {
              currentUserState = this.#getCurrentUserStates();
              location.reload();
            }
          });
        }
        location.reload();
      });
    });
  };

  // Consigue el estado de la tabla en el momento que se ejecuta esta función.
  // Esta función no va a recoger los datos de los inputs
  #getCurrentUserStates = () => {
    // Creo un mapa que asocia el id de un usuario con las propiedades de este usuario.
    const users = new Map();
    // Obtenemos todas las filas del body de la tabla
    const rows = usuarios_secundarios_container.querySelector('table').querySelector('tbody').querySelectorAll('tr');
    for (let i = 0; i < rows.length - 1; i++) {
      const row = rows[i];
      // Nota: No se pueden cambiar nombre o correo.
      // solo tenemos que mirar estas columnas: 2,3,4,5,6 (permitir pedidos, ver administracion, no mostrar precios, precios, solo pvp).
      const allowOrder = row.querySelector('input[name=permitirPedidos]').checked;
      const allowAdmin = row.querySelector('input[name=verAdmin]').checked;
      // Si recogemos los tres radio buttons en un array, los índices volverán a ser entre 0 y 2, que son exactamente los valores que buscamos para ese metafield.
      const pricesDisplayTypeArray = [
        row.querySelector('input.radio-noPrice').checked,
        row.querySelector('input.radio-price').checked,
        row.querySelector('input.radio-onlypvp').checked,
      ];
      // Obtengo los IDs de todas las ubicaciones.
      const locationIDs = row.querySelector('.checkbox-direction-column').querySelectorAll('input[type=checkbox]');
      const contactId = row.querySelector('.delete_btn').id;
      // Ahora los almaceno en otro mapa en el que asocio su ID a si están habilitados o no.
      const locationData = new Map();
      locationIDs.forEach((location) => {
        locationData.set(location.className, [location.checked, location.id]);
      });
      // En teoría todos los usuarios deberían de tener alguno de estos permisos
      let pricesDisplayType = pricesDisplayTypeArray.findIndex((val) => val == true);
      // En el caso de que ese no sea el caso, pasarán a tener el valor de 0.
      if (pricesDisplayType < 0 || pricesDisplayType > 2) pricesDisplayType = 0;
      const userData = {
        allowOrder: allowOrder,
        allowAdmin: allowAdmin,
        pricesDisplayType: pricesDisplayType,
        locations: Object.fromEntries(locationData),
        contactId: contactId,
      };
      users.set(row.id, userData);
    }
    return users;
  };

  // Esta función toma un mapa que contiene los datos de los usuarios en la tabla en algún momento durante la ejecución del javascript y la comparará con el momento actual.
  // En caso de que haya diferencia la función devolverá un mapa con las diferencias, en caso de que no exista ninguna diferencia, la función devolverá "false"
  #getUserStateDelta = (tableUserStates) => {
    const currentState = this.#getCurrentUserStates();
    const res = new Map();
    currentState.forEach((val, key) => {
      const user = tableUserStates.get(key);
      // La manera más sencilla de comparar ambos datos es convertirlos en string y ver si son iguales.
      if (JSON.stringify(val) != JSON.stringify(user)) {
        // Ahora toca comprobar si ha cambiado alguna ubicación, y si es el caso, guardar solo aquellas que se han cambiado.
        let valLocationsToMap = new Map(Object.entries(val.locations));
        let userLocationsToMap = new Map(Object.entries(user.locations));
        let locationsDiff = new Map();
        valLocationsToMap.forEach((val2, key2) => {
          if (val2 != userLocationsToMap.get(key2)) {
            locationsDiff.set(key2, val2);
          }
        });
        val.locations = Object.fromEntries(locationsDiff);
        res.set(key, val);
      }
    });
    if (res.size > 0) return res;
    return false;
  };

  // Esta función se encarga de enviar a la aplicación una petición con los datos de todos los usuarios cuyos permisos han sido alterados.
  // Toma como parámetro un mapa que contiene el id del usuario como clave y un objeto que contiene todos los permisos de ese usuario.
  #updateModifiedUsers = async (dataMap, companyID) => {
    const data = [];
    dataMap.forEach(async (val, key) => {
      // Debido a que solo queremos actualizar los usuarios, podemos dejar
      // Lo transformo todo a strings para no tener que hacer esto en el servidor.
      const permissionData = {
        ownerId: key,
        allowOrder: val.allowOrder.toString(),
        allowAdmin: val.allowAdmin.toString(),
        pricesDisplayType: val.pricesDisplayType.toString(),
        locations: JSON.stringify(val.locations),
        contactId: val.contactId,
      };
      data.push(permissionData);
    });
    let res = await fetch(this.#appURL + '/company/updateCustomerMetafields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        userid: this.userID,
        companyid: companyID,
        inputData: data,
      }),
    });
    return res;
  };

  #getNewUserData = () => {
    const inputRow = usuarios_secundarios_container.querySelector('.usuarios-secundarios-inputs');
    const name = inputRow.querySelector('#usuarios-secundarios-nombre').value;
    const email = inputRow.querySelector('#usuarios-secundarios-email').value;
    if (!name || !email) return false;
    if (!this.#emailExp.test(email)) return false;
    const allowOrder = inputRow.querySelector('input[name=permitirPedidos]').checked;
    const allowAdmin = inputRow.querySelector('input[name=verAdmin]').checked;
    const pricesDisplayType = Array.from(inputRow.querySelectorAll('input[name=preciosRad]')).findIndex(
      (radio) => radio.checked
    );
    if (pricesDisplayType == -1) {
      console.error('Algo fue mal intentando obtener el permiso de precios.');
      return false;
    }
    // Para crear un contacto solo nos hace falta saber qué locations se han marcado.
    const locationData = Array.from(inputRow.querySelectorAll('#address1'))
      .filter((item) => item.checked)
      .map((item) => item.className);
    const res = {
      contactData: {
        title: name,
        firstName: name,
        email: email,
        locations: locationData,
      },
      permissions: {
        allowOrder: allowOrder,
        allowAdmin: allowAdmin,
        pricesDisplayType: pricesDisplayType,
      },
    };
    return res;
  };

  #deleteCompanyContact = async (contactId) => {
    contactId = contactId.split('/')[contactId.split('/').length - 1];
    const request = await fetch(this.#appURL + '/company/deleteCompanyContact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        userid: this.userID,
        contactid: contactId,
      }),
    });
    if (request.status == 200) {
      // Si todo ha ido bien devolvemos true
      return true;
    }
    return false;
  };

  #createCompanyContact = async (userData, companyID) => {
    let res = await fetch(this.#appURL + '/company/createCompanyContact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        userid: this.userID,
        companyid: companyID,
        inputData: userData,
      }),
    });
    res = await res.json();
    return res;
  };

  #getUserData = async () => {
      try {
        let res = await fetch(this.#appURL + '/customers/userData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: Shopify.shop,
          userid: this.userID,
        }),
      });
      res = await res.json();
      return res.data.userData;
    } catch(error) {
      console.error('Error conectando a la aplicación: ', error);
      return {
        res: {
          data: {
            userData: false
          }
        }
      };
    }
  };

  #getCompanyData = async (companyID, cursor = null, mode = null) => {
    if (cursor) console.log('Cursor provided');
    let res = await fetch(this.#appURL + '/company/companyData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: Shopify.shop,
        userid: this.userID,
        companyid: companyID,
        cursor: cursor,
        mode: mode,
      }),
    });
    res = await res.json();
    return res;
  };

  #formattedLocation = (formattedAddress) => {
    return formattedAddress.join(' ');
  };

  #getLocationIDsForContact = (contactData) => {
    const res = new Map();
    const rolesData = contactData.roleAssignments.edges;
    for (let i = 0; i < rolesData.length; i++) {
      const role = rolesData[i].node;
      //res.push(role.companyLocation.id);
      res.set(role.companyLocation.id, role.id);
    }
    return res;
  };

  #destroyDataTable = () => {
    const table = usuarios_secundarios_container.querySelector('#usuariosSecundarios-table');
    const childrenArray = Array.from(table.querySelector('tbody').children);
    table.querySelector('tbody').innerHTML = `<tr class="usuarios-secundarios-inputs">${
      childrenArray.filter((child) => child.className == 'usuarios-secundarios-inputs')[0].innerHTML
    }</tr>`;
  };

  #displayDataInTable = (companyData) => {
    const table = usuarios_secundarios_container.querySelector('#usuariosSecundarios-table');
    const tbody = table.querySelector('tbody');
    const locationData = companyData.locations.edges;
    const locations = this.#formattedLocation(locationData);
    // Ahora tenemos que hacer una fila para cada uno de los clientes de la empresa.
    // Los clientes estaŕan dentro del array "companyData.contacts.edges"
    companyData.contacts.edges.forEach(({ node }) => {
      // Esto devolverá un nodo con un elemento "customer" que contiene los datos de nuestro cliente
      let customerData = node.customer;
      // Primero comprobamos que un usuario tiene los metacampos asignados.
      if (customerData.allowAdmin == null || customerData.allowOrder == null || customerData.pricesDisplayType == null) {
        customerData.allowAdmin = { value: 'false' };
        customerData.allowOrder = { value: 'false' };
      }
      // Ahora es solo cuestión de crear todas las filas y todos los campos adecuadamente.
      const row = document.createElement('tr');
      row.id = customerData.id.split('/')[4];
      row.innerHTML = `
      <td>${customerData.firstName}</td>
      <td>${customerData.email}</td>
      <td>
        <input type="checkbox" name="permitirPedidos">
      </td>
      <td>
        <input type="checkbox" name="verAdmin">
      </td>
      <td>
        <input type="radio" name="preciosRad_${customerData.firstName}" class="radio-noPrice">
      </td>
      <td>
        <input type="radio" name="preciosRad_${customerData.firstName}" class="radio-price">
      </td>
      <td>
        <input type="radio" name="preciosRad_${customerData.firstName}" class="radio-onlypvp">
      </td>
      <td id="companyAddress" class="checkbox-direction-column"></td>
      <td>
        <button class="button delete_btn" id="${node.id.split('/')[node.id.split('/').length - 1]}">Delete</button>
      </td>
      `;
      if (customerData.allowOrder.value === 'true') row.querySelector('input[name="permitirPedidos"]').checked = true;
      if (customerData.allowAdmin.value === 'true') row.querySelector('input[name="verAdmin"]').checked = true;
      if(customerData.pricesDisplayType != null) {
        row.querySelectorAll(`input[type=radio][name="preciosRad_${customerData.firstName}"]`)[
        parseInt(customerData.pricesDisplayType.value)
        ].checked = true;
      }
      const addressesField = row.querySelector('#companyAddress');
      locationData.forEach((location) => {
        const addressesContainer = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.name = 'address';
        checkbox.type = 'checkbox';
        checkbox.className = location.location.id;
        if (Array.from(this.#getLocationIDsForContact(node).keys()).includes(location.location.id)) {
          checkbox.checked = true;
          checkbox.id = this.#getLocationIDsForContact(node).get(location.location.id);
        }
        const label = document.createElement('label');
        label.innerHTML = this.#formattedLocation(location.location.shippingAddress.formattedAddress);
        addressesContainer.append(checkbox, label);
        addressesField.append(addressesContainer);
      });
      const button = row.querySelector('button.delete_btn');
      button.addEventListener('click', () => {
        const safetyCheck = confirm('¿Desea eliminar este contacto de tu empresa?');
        if (!safetyCheck) return console.log('Operación de eliminación cancelada');
        this.#deleteCompanyContact(button.id).then(() => {
          location.reload();
        });
      });
      if (customerData.id == `gid://shopify/Customer/${this.userID}`) button.style.display = 'none';
      tbody.prepend(row);
    });
  };
})(userID).init();
