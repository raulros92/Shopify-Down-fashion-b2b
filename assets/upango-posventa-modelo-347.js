(function () {

    function obtenerPrimerDiaAnoAnterior() {
        const añoAnterior = new Date().getFullYear() - 1;
        return `${añoAnterior}-01-01`;
    }

    function obtenerUltimoDiaAnoAnterior() {
        const añoAnterior = new Date().getFullYear() - 1;
        return `${añoAnterior}-12-31`;
    }

    function consultaFacturas() {
        (async () => {

            // Datos
            const numeroFactura = "";
            const numeroAlbaran = "";
            const numeroPedido = "";
            const fechaDesde = obtenerPrimerDiaAnoAnterior();
            const fechaHasta = obtenerUltimoDiaAnoAnterior();

            const formData = new FormData();
            formData.append('companyId', companyId);
            formData.append('numeroFactura', numeroFactura);
            formData.append('numeroAlbaran', numeroAlbaran);
            formData.append('numeroPedido', numeroPedido);
            formData.append('fechaDesde', fechaDesde);
            formData.append('fechaHasta', fechaHasta);
            formData.append('shop', Shopify.shop);
            formData.append('customer', __st.cid);
            console.log(formData);
            const plainFormData = Object.fromEntries(formData.entries());
            const formDataJsonString = JSON.stringify(plainFormData);
            console.log('json: ' + formDataJsonString);

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: formDataJsonString
            };

            const response = await fetch('/apps/upango-posventa/consulta_facturas/', fetchOptions);
            if (checkResponseOk(response)) {
                const jsonData = await response.json();
                console.log("consulta_facturas jsonData: " + jsonData);

                checkErrorsInPosventaResponse(jsonData)

                if (jsonData.data != null && jsonData.data.facturas != null) {
                    const facturas = jsonData.data.facturas;
                    //Mostrar facturas
                    showFacturas(facturas);
                }
            }
        })();
    }

    function calcularImporteTrimestral(facturas, trimestre) {
        // Define los límites de fecha para el trimestre dado del año anterior
        const añoActual = new Date().getFullYear();
        const inicioTrimestre = new Date(añoActual - 1, (trimestre - 1) * 3, 1);
        const finTrimestre = new Date(añoActual - 1, trimestre * 3, 0);
        console.log(inicioTrimestre);
        console.log(finTrimestre);

        // Filtra las facturas del año anterior que están dentro del trimestre dado
        const facturasEnTrimestre = facturas.filter(factura => {
            const fechaFactura = new Date(factura.fechaFactura);
            fechaFactura.setHours(0, 0, 0, 0);
            console.log(fechaFactura);
            return (
                fechaFactura >= inicioTrimestre &&
                fechaFactura <= finTrimestre &&
                fechaFactura.getFullYear() === añoActual - 1
            );
        });

        // Suma el importe de las facturas en el trimestre
        const importeTotal = facturasEnTrimestre.reduce((total, factura) => total + factura.importe, 0);

        return importeTotal;
    }

    // Función para calcular el importe total de los totales positivos de las facturas
    function calcularImporteTotalPositivo(facturas) {
        // Filtrar las facturas con totales positivos
        const facturasPositivas = facturas.filter(factura => factura.importe > 0);

        // Sumar los importes de las facturas positivas
        const importeTotalPositivo = facturasPositivas.reduce((total, factura) => total + factura.importe, 0);

        return importeTotalPositivo;
    }

    // Función para calcular el importe total de los totales negativos de las facturas
    function calcularImporteTotalNegativo(facturas) {
        // Filtrar las facturas con totales negativos
        const facturasNegativas = facturas.filter(factura => factura.importe < 0);

        // Sumar los importes de las facturas negativas (convirtiendo los importes negativos a positivos)
        const importeTotalNegativo = facturasNegativas.reduce((total, factura) => total - factura.importe, 0);

        return importeTotalNegativo;
    }

    // Función para crear una fila de total reutilizable
    function crearFilaTotal(textoColumna1, importeTotal) {
        const rowTotal = document.createElement("tr");
        const relleno = document.createElement("td");
        const relleno2 = document.createElement("td");
        const relleno3 = document.createElement("td");
        rowTotal.appendChild(relleno);
        rowTotal.appendChild(relleno2);
        rowTotal.appendChild(relleno3);
        // Crear celda para el texto en la penúltima columna
        const cellTextTotal = document.createElement("td");
        cellTextTotal.classList.add('resumen-total'); // Agregar la clase solo a esta celda
        cellTextTotal.textContent = textoColumna1;
        cellTextTotal.style.fontWeight = 'bold'; // Agregar negrita
        cellTextTotal.style.backgroundColor = "#f2f2f2";
        rowTotal.appendChild(cellTextTotal);

        // Crear celda para mostrar la suma total en la última columna
        const cellSumaTotal = document.createElement("td");
        cellSumaTotal.style.backgroundColor = "#f2f2f2";
        cellSumaTotal.classList.add('resumen-total'); // Agregar la clase solo a esta celda
        cellSumaTotal.textContent = importeTotal === 0 ? '0,00 €' : formatMoney(importeTotal);
        rowTotal.appendChild(cellSumaTotal);

        return rowTotal;
    }

    function showFacturas(facturas) {
        console.log('showFacturas');

        const importeT1 = calcularImporteTrimestral(facturas, 1);
        const importeT2 = calcularImporteTrimestral(facturas, 2);
        const importeT3 = calcularImporteTrimestral(facturas, 3);
        const importeT4 = calcularImporteTrimestral(facturas, 4);
        const importeTotal = importeT1 + importeT2 + importeT3 + importeT4;

        const tableTrimestre = document.querySelector("#trimestres-table tbody");
        const rowTri = document.createElement("tr");
        rowTri.appendChild(buildResultCell(importeTotal, theadTitles.importe));
        rowTri.appendChild(buildResultCell(importeT1, theadTitles.trimestre1));
        rowTri.appendChild(buildResultCell(importeT2, theadTitles.trimestre2));
        rowTri.appendChild(buildResultCell(importeT3, theadTitles.trimestre3));
        rowTri.appendChild(buildResultCell(importeT4, theadTitles.trimestre4));

        tableTrimestre.appendChild(rowTri);

        const table = document.querySelector("#facturas-table tbody");

        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        facturas.forEach((factura) => {
            const row = document.createElement("tr");

            row.appendChild(buildResultCell(factura.numeroFactura, theadTitles.numero));
            row.appendChild(buildResultCell(factura.fechaFactura, theadTitles.fechaFacturacion, 'Date'));
            row.appendChild(buildResultCell(companyFiscal, theadTitles.nombreFiscal));
            row.appendChild(buildResultCell('', ''));
            row.appendChild(buildResultCell(factura.importe, theadTitles.total, 'Money'));

            table.appendChild(row);

        });

        const sumaTotalCargos = calcularImporteTotalPositivo(facturas);
        // Crear fila para el total de cargos
        const rowTotalCargos = crearFilaTotal(theadTitles.total_cargos, sumaTotalCargos);

        // Agregar la fila del total de cargos a la tabla
        table.appendChild(rowTotalCargos);

        const sumaTotalAbonos = calcularImporteTotalNegativo(facturas);
        // Crear fila para el total de abonos
        const rowTotalAbonos = crearFilaTotal(theadTitles.total_abonos, sumaTotalAbonos);
        table.appendChild(rowTotalAbonos);

        const sumaTotalModelo347 = facturas.reduce((total, factura) => total + factura.importe, 0);
        // Crear fila para el total del modelo 347
        const rowTotalModelo347 = crearFilaTotal(theadTitles.total_modelo, sumaTotalModelo347);

        // Agregar la fila del total del modelo 347 a la tabla
        table.appendChild(rowTotalModelo347);

        document.getElementById('numero-resultados-consulta-posventa').innerHTML = facturas.length;
    }

    //Busqueda inicial
    document.addEventListener("DOMContentLoaded", function () {
        consultaFacturas();
    });

})();