function formatDatePosventa(fecha) {
  var date = new Date(fecha);

  var dia = date.getDate();
  var mes = date.getMonth() + 1; // Los meses en JavaScript son base 0, se suma 1 para obtener el mes correcto
  var anio = date.getFullYear();

  var diaFormateado = dia < 10 ? '0' + dia : dia;
  var mesFormateado = mes < 10 ? '0' + mes : mes;

  var fechaFormateada = diaFormateado + '/' + mesFormateado + '/' + anio;

  return fechaFormateada;
}

function formatMoney(precio) {
  if (precio == null || precio == '') return '';
  const precioFormateado = precio.toFixed(2);
  const precioConComa = precioFormateado.replace('.', ',');
  const precioFinal = `${precioConComa} €`;
  return precioFinal;
}

function buildEstadoCell(estadoCell, estado) {
  const spanEstado = document.createElement('span');

  let classValue = '';
  if (estado == 'PENDIENTE' || estado == 'SIN FACTURAR') {
    classValue = 'upng-en-preparacion';
  } else if (estado == 'SERVIDO' || estado == 'FACTURADO') {
    classValue = 'upng-confirmado';
  }
  spanEstado.setAttribute('class', classValue);
  spanEstado.textContent = estado;

  estadoCell.appendChild(spanEstado);
}

function verDetalleCell(idAnchor, text) {
  const cell = document.createElement('td');
  cell.setAttribute('class', 'cell-link');
  const anchor = document.createElement('a');
  anchor.innerHTML = text;
  anchor.setAttribute('id', idAnchor);
  anchor.setAttribute('href', '#');
  anchor.setAttribute('class', 'link link--text');
  cell.appendChild(anchor);
  return cell;
}

function descargarDocumentoCell(idButton) {
  const cell = document.createElement('td');
  cell.setAttribute('class', 'cell-download');
  const button = document.createElement('button');
  button.setAttribute('id', idButton);
  //button.setAttribute('href',"#");
  button.setAttribute('class', 'link');

  button.innerHTML = `
        <span><svg xmlns="http://www.w3.org/2000/svg" width="21" height="29" viewBox="0 0 21 29" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M9.81948 21.2349C9.48097 21.2349 9.2623 21.2648 9.13281 21.2945V25.6839C9.26251 25.7138 9.47152 25.7138 9.66047 25.7138C11.0336 25.7234 11.9297 24.9675 11.9297 23.3649C11.9393 21.9711 11.1233 21.2349 9.81948 21.2349V21.2349Z"
                fill="#C32A2A" />
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M3.95514 21.2152C3.64694 21.2152 3.43791 21.2447 3.32812 21.2745V23.2555C3.45762 23.2852 3.61704 23.2955 3.83507 23.2955C4.642 23.2955 5.13933 22.8871 5.13933 22.2004C5.13953 21.5835 4.71127 21.2152 3.95514 21.2152V21.2152Z"
                fill="#C32A2A" />
            <path
                d="M20.4567 6.75899C20.4551 6.62969 20.414 6.50196 20.3252 6.4008L14.8869 0.18913C14.8857 0.187359 14.8837 0.186768 14.8826 0.185194C14.8501 0.148981 14.8129 0.119263 14.7729 0.0928929C14.7609 0.0852176 14.7485 0.0783293 14.7361 0.071244C14.7015 0.0525475 14.6653 0.0369995 14.6271 0.0255848C14.6173 0.0226327 14.6076 0.0185 14.5974 0.0157446C14.5565 0.00590434 14.5137 0 14.471 0H1.10605C0.496168 0 0 0.496349 0 1.10605V27.0979C0 27.708 0.496153 28.204 1.10605 28.204H19.3556C19.9655 28.204 20.4619 27.708 20.4619 27.0979V6.82095C20.4617 6.80009 20.4585 6.77982 20.4564 6.75895L20.4567 6.75899ZM6.02507 23.753C5.50764 24.2407 4.74132 24.46 3.84522 24.46C3.64644 24.46 3.46676 24.4497 3.32799 24.4302V26.8287H1.82518V20.2094C2.29259 20.1301 2.94992 20.0701 3.8757 20.0701C4.8111 20.0701 5.47812 20.2494 5.92582 20.6076C6.35407 20.9461 6.6418 21.5034 6.6418 22.1602C6.6418 22.8173 6.42335 23.3746 6.02502 23.7527L6.02507 23.753ZM12.4252 26.0327C11.7194 26.6197 10.6444 26.8984 9.33097 26.8984C8.54455 26.8984 7.98737 26.8486 7.6085 26.799V20.2095C8.16603 20.1203 8.89285 20.0702 9.65922 20.0702C10.9324 20.0702 11.7588 20.2992 12.4061 20.7868C13.103 21.3045 13.541 22.1306 13.541 23.3149C13.5405 24.5991 13.0726 25.4849 12.4252 26.0325V26.0327ZM18.6373 21.3644H16.059V22.8971H18.4677V24.1317H16.059V26.8287H14.5367V20.1208H18.6373V21.3644ZM1.10622 18.7799V1.10621H13.918V6.76519C13.918 7.07044 14.1654 7.31824 14.4711 7.31824H19.3558L19.3564 18.7798L1.10622 18.7799Z"
                fill="#C32A2A" />
            <path
                d="M15.9056 11.8869C15.8733 11.884 15.094 11.8127 13.8977 11.8127C13.523 11.8127 13.1455 11.8202 12.7728 11.8342C10.4105 10.0613 8.4757 8.28736 7.43979 7.29306C7.45868 7.18364 7.47167 7.09704 7.47757 7.03052C7.61435 5.58832 7.46242 4.61473 7.02767 4.13665C6.74309 3.82432 6.32529 3.7204 5.88933 3.83947C5.61872 3.91032 5.11767 4.17286 4.95705 4.70741C4.78012 5.29825 5.0647 6.01499 5.81275 6.84651C5.82456 6.8591 6.07843 7.12499 6.53957 7.57569C6.23983 9.0049 5.45518 12.0893 5.07454 13.5702C4.18025 14.0481 3.43514 14.6235 2.85851 15.2838L2.82073 15.3271L2.79632 15.3789C2.73688 15.5037 2.45289 16.1516 2.66604 16.6719C2.76346 16.9085 2.9459 17.0813 3.19369 17.172L3.26002 17.1899C3.26002 17.1899 3.31985 17.2027 3.42533 17.2027C3.88665 17.2027 5.02538 16.9604 5.63627 14.7094L5.78427 14.139C7.91646 13.1027 10.5817 12.7685 12.5134 12.6752C13.5071 13.4122 14.4958 14.089 15.4539 14.6885L15.4851 14.7066C15.5316 14.7304 15.9518 14.9379 16.4438 14.9382C17.147 14.9382 17.6606 14.5069 17.8517 13.7549L17.8614 13.7033C17.9149 13.2737 17.8068 12.8861 17.5492 12.5834C17.0066 11.9454 15.9962 11.8899 15.9053 11.8868L15.9056 11.8869ZM3.44243 16.373C3.4381 16.3678 3.43613 16.3631 3.43397 16.3576C3.38811 16.2472 3.44302 15.9793 3.52411 15.7831C3.87186 15.3943 4.28932 15.0372 4.77108 14.7158C4.30189 16.2346 3.61973 16.3659 3.44244 16.373L3.44243 16.373ZM6.4211 6.28284C5.70078 5.48085 5.71141 5.08328 5.75021 4.94946C5.81397 4.72569 6.10092 4.64106 6.10348 4.64028C6.24793 4.60111 6.33571 4.60879 6.41384 4.6946C6.59057 4.88865 6.74231 5.47452 6.68248 6.54913C6.51224 6.3781 6.42112 6.28285 6.42112 6.28285L6.4211 6.28284ZM6.04894 13.1122L6.06134 13.0648L6.05976 13.0654C6.42051 11.6523 6.94065 9.58347 7.23983 8.25463L7.25065 8.26486L7.25163 8.25856C8.21953 9.16998 9.70345 10.503 11.4802 11.8892L11.4604 11.8902L11.4897 11.9123C9.81583 12.0538 7.8167 12.3836 6.04888 13.1122L6.04894 13.1122ZM17.0414 13.5757C16.9139 14.0441 16.6687 14.108 16.4439 14.108C16.1832 14.108 15.932 13.9996 15.8748 13.9732C15.2224 13.5644 14.555 13.1187 13.8815 12.642H13.8977C15.0523 12.642 15.8213 12.7121 15.8515 12.7142C16.0444 12.7215 16.6547 12.8116 16.9176 13.1208C17.0208 13.2419 17.0603 13.3869 17.0414 13.5756L17.0414 13.5757Z"
                fill="#C32A2A" />
        </svg></span>
        <div class="loading-overlay__spinner hidden">
        <svg
            aria-hidden="true"
            focusable="false"
            class="spinner"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
        </svg>
        </div>
    `;

  cell.appendChild(button);

  return cell;
}

function checkResponseOk(response) {
  if (!response.ok) {
    const errorMessage = errorMessages.error_general;
    showPosventaErrors([errorMessage]);
    return false;
  }
  return true;
}

//Revisa los datos recibidos y muestra errores si es necesario
//return: true si hay errores, false si no
function checkErrorsInPosventaResponse(jsonResponseData) {
  //Revisamos si existe un código de error
  if (jsonResponseData.cod_error != null && jsonResponseData.cod_error != '') {
    //errorMessages se define en la section liquid para usar traducciones
    const errorMessage = errorMessages[jsonResponseData.cod_error];
    showPosventaErrors([errorMessage]);
    return true;
  }
  //Revisamos que contenga datos
  if (jsonResponseData.data == null) {
    const errorMessage = errorMessages.no_data;
    showPosventaErrors([errorMessage]);
    return true;
  }
  return false;
}

function showPosventaErrors(errorMessages) {
  const errorMessagesParentElement = document.getElementById('posventa-results');
  showErrorMessages(errorMessagesParentElement, errorMessages);
}

function fechaDesdeDefaultValue() {
  var currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1); //Un mes antes
  var formattedDate = currentDate.toISOString().slice(0, 10); //Formato para el input
  return formattedDate;
}

function fechaHastaDefaultValue() {
  var currentDate = new Date();
  var formattedDate = currentDate.toISOString().slice(0, 10); //Formato para el input
  return formattedDate;
}

function buildResultCell(value, theadTitle, format) {
  const newCell = document.createElement('td');
  const valueSpan = document.createElement('span');
  const theadSpan = document.createElement('span');
  var formattedValue = value;

  if (format != null) {
    if (format == 'Date') {
      formattedValue = formatDatePosventa(value);
    } else if (format == 'Money') {
      formattedValue = formatMoney(value);
    } else if (format == 'Status') {
      let classValue = '';
      if (value == 'PENDIENTE' || value == 'SIN FACTURAR') {
        classValue = 'upng-en-preparacion status warning';
      } else if (value == 'SERVIDO' || value == 'FACTURADO') {
        classValue = 'upng-confirmado status success';
      } else {
        classValue = 'upng-cancelado status danger';
      }
      valueSpan.setAttribute('class', classValue);
    }
  }

  theadSpan.setAttribute('class', 'upng-thead-mobile');
  theadSpan.textContent = theadTitle;
  valueSpan.textContent = formattedValue;

  newCell.appendChild(theadSpan);
  newCell.appendChild(valueSpan);
  return newCell;
}
