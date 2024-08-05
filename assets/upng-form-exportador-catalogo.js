document.addEventListener('DOMContentLoaded', function () {
  // Ocultar los elementos <select> originales
  const hiddenSelects = document.querySelectorAll('.hidden-select');
  hiddenSelects.forEach(function (select) {
    select.style.display = 'none';
  });

  // Crear checkboxes para cada select
  createCheckboxes('categoria', 'categoria-checkbox-list');

  const dropdownButtons = document.querySelectorAll('.dropdown-btn');

  dropdownButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const dropdownContent = this.nextElementSibling;
      if (dropdownContent.style.display === 'block') {
        dropdownContent.style.display = 'none';
      } else {
        dropdownContent.style.display = 'block';
      }
    });

    // Cerrar el menú desplegable al hacer clic fuera de él
    document.addEventListener('click', function (event) {
      dropdownButtons.forEach(function (button) {
        const dropdownContent = button.nextElementSibling;
        if (!button.contains(event.target) && !dropdownContent.contains(event.target)) {
          dropdownContent.style.display = 'none';
        }
      });
    });
  });

  // Obtener referencias a los checkboxes
  const mostrarPreciosCheckbox = document.getElementById('mostrar_precios');
  const mostrarPreciosSinIvaCheckbox = document.getElementById('mostrar_precios_sin_iva');
  const mostrarPreciosConIvaCheckbox = document.getElementById('mostrar_precios_iva');

  // Agregar un event listener al checkbox "Mostrar Precios"
  mostrarPreciosCheckbox.addEventListener('change', function () {
    // Habilitar o deshabilitar los otros checkboxes según el estado del checkbox "Mostrar Precios"
    mostrarPreciosSinIvaCheckbox.disabled = !this.checked;
    mostrarPreciosConIvaCheckbox.disabled = !this.checked;
    mostrarPreciosSinIvaCheckbox.checked = this.checked;
    mostrarPreciosConIvaCheckbox.checked = this.checked;
  });

  document.getElementById('formularioExportarCatalogo').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional
    enviarFormularioFiltroExportador();
  });
});

function createCheckboxes(selectId, containerId) {
  const select = document.getElementById(selectId);
  const container = document.getElementById(containerId);

  Array.from(select.options).forEach(function (option) {
    const checkboxItem = document.createElement('div');
    checkboxItem.classList.add('checkbox-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = option.value;
    checkbox.id = selectId + '-' + option.value; // Agregar identificador único
    checkbox.checked = option.selected;
    checkbox.addEventListener('change', function () {
      option.selected = checkbox.checked;
    });

    checkboxItem.appendChild(checkbox);

    const label = document.createElement('label');
    label.classList.add('checkbox-label');
    label.setAttribute('for', selectId + '-' + option.value); // Agregar identificador único
    label.textContent = option.text;
    checkboxItem.appendChild(label);

    container.appendChild(checkboxItem);
  });
}

function obtenerFechaActualExportador() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
  const dia = ('0' + fecha.getDate()).slice(-2);
  return dia + '-' + mes + '-' + anio;
}

function showExportCatalogoErrors(errorMessages) {
  const errorMessagesParentElement = document.getElementById('exportar-catalogo-result');
  showErrorMessages(errorMessagesParentElement, errorMessages);
}

function showExportCatalogoResult(messages) {
  const errorMessagesParentElement = document.getElementById('exportar-catalogo-result');
  showInfoMessages(errorMessagesParentElement, messages);
}

function enviarFormularioFiltroExportador() {
  //Activamos el loading en el button submit
  const buttonSubmitExportador = document.getElementById('submitButtonExportador'); // Recupera el botón por su id
  showLoading(buttonSubmitExportador, true);

  const formulario = document.getElementById('formularioExportarCatalogo');
  const formData = new FormData(formulario);

  // Agrega el atributo 'shop' al objeto FormData
  formData.append('shop', shop);
  formData.append('localizacion', localizacion);
  formData.append('idioma', idioma);
  formData.append('email', email);

  // Muestra los datos en la consola o realiza cualquier otra acción
  for (const pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }

  fetch('/apps/upango_exportador_catalogo/exportar', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        // Si la respuesta es exitosa, muestra un mensaje
        console.log('La solicitud se procesó correctamente.');
        showExportCatalogoResult([locales.alert_ok]);
      } else {
        // Si la respuesta no es exitosa, muestra un mensaje de error
        console.error('Error en la respuesta:', response.statusText);
        showExportCatalogoErrors([locales.alert_respuesta_mal]);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      // Puedes manejar errores aquí, por ejemplo, mostrar un mensaje al usuario
      showExportCatalogoErrors([locales.alert_fallo]);
    })
    .finally(() => {
      // Desactivamos el loading en el botón submit independientemente de si la promesa fue resuelta o rechazada
      showLoading(buttonSubmitExportador, false);
    });
}
