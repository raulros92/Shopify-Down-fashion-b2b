(function () {
    function consultaFacturas() {
        (async () => {
            const form = document.getElementById('posventa-facturas-form');
            var button = form.querySelector("button");
            showLoading(button,true);
            const formData = new FormData(form);

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
            if(checkResponseOk(response)){
                const jsonData = await response.json();
                console.log("consulta_facturas jsonData: " + jsonData);

                checkErrorsInPosventaResponse(jsonData)
                
                if(jsonData.data!=null && jsonData.data.facturas!=null){
                    const facturas = jsonData.data.facturas;
                    //Mostrar facturas
                    showFacturas(facturas);
                }
            }
            showLoading(button,false);
        })();
    }

    function showFacturas(facturas) {
        console.log('showFacturas');

        const table = document.querySelector("#facturas-table tbody");
        
        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        facturas.forEach((factura) => {
            const row = document.createElement("tr");

            row.appendChild(buildResultCell(factura.serie,theadTitles.serie));
            row.appendChild(buildResultCell(factura.numeroFactura,theadTitles.numero));
            row.appendChild(buildResultCell(factura.fechaFactura,theadTitles.fechaFacturacion,'Date'));
            row.appendChild(buildResultCell(factura.fechaVencimiento,theadTitles.fechaVencimiento,'Date'));
            row.appendChild(buildResultCell(factura.importe,theadTitles.total,'Money'));

            const idBotonVerDetalle = "ver-factura-"+factura.id;
            
            row.appendChild(verDetalleCell(idBotonVerDetalle,verDetalleText));

            const idBotonDescargaDocumento = "descarga-documento-"+factura.id;
            row.appendChild(descargarDocumentoCell(idBotonDescargaDocumento));

            table.appendChild(row);

            const botonDescargar = document.querySelector("#"+ idBotonDescargaDocumento);
            botonDescargar.addEventListener("click", (event) => {
                event.preventDefault();
                descargaDocumento(factura.id,botonDescargar);
            });

            document
                .querySelector("#"+ idBotonVerDetalle)
                .addEventListener("click", (event) => {
                    event.preventDefault();
                    consultaLineas(factura.id);
                });
        });

        document.getElementById('numero-resultados-consulta-posventa').innerHTML=facturas.length;
    }

    function consultaLineas(idFactura) {
        (async () => {
            console.log('consultaLineas idFactura:',idFactura);

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    'idFactura':idFactura,
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            const response = await fetch('/apps/upango-posventa/consulta_lineas_factura/', fetchOptions);
            const jsonData = await response.json();

            //TODO: Comprobar si hay errores y mostrar mensaje en ese caso
            const lineas = jsonData.data.lineas;

            //Mostrar pedidos
            showLineasFacturas(lineas);

        })();
    }

    function showLineasFacturas(lineas) {
        console.log('showLineasFacturas');
        const table = document.querySelector("#lineas-posventa-table tbody");

        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        lineas.forEach((linea) => {
            const row = document.createElement("tr");

/*            baseImponible;// 1589.98, (decimal)
            dto;// 0, (decimal)
            estado;// "SERVIDO", (Texto)
            -formato;// "25K", (Texto)
            -iva;// 333.9, (decimal)
            id;// 360, (entero, código identificativo único de la línea de factura)
            -idProducto;// 983, (entero, código identificativo único del producto en el ERP o variedad para vosotros)
            -importeTotal;// 1923.88, (decimal)
            -numEnvases;// 2, (decimal)
            -precioUd;// 34.868, (decimal)
            -producto;// "ACEITE VEGETAL DE ARGÁN ECOLÓGICO (L) 25 ", (Texto)
            -unidades;// 45.6 (decimal)
*/
            const nombreProductoCell = document.createElement("td");
            const referenciaProductoCell = document.createElement("td");
            const formatoCell = document.createElement("td");
            const unidadesCell = document.createElement("td");
            const precioUdCell = document.createElement("td");
            const ivaCell = document.createElement("td");
            const importeTotal = document.createElement("td");

            nombreProductoCell.textContent = linea.producto;
            //TODO: Pendiente de cambiar cuando nos pasen la referencia
            referenciaProductoCell.textContent = linea.idProducto;
            formatoCell.textContent = linea.formato;
            unidadesCell.textContent = linea.numEnvases;
            precioUdCell.textContent = formatMoney(linea.precioUd);
            ivaCell.textContent = formatMoney(linea.iva);
            importeTotal.textContent = formatMoney(linea.importeTotal);
            if(linea.dto != null && linea.dto != '' && linea.dto !=0){
                importeTotal.textContent = importeTotal.textContent+ '(dto '+formatMoney(linea.importeTotal)+')';
            }

            row.appendChild(nombreProductoCell);
            row.appendChild(referenciaProductoCell);
            row.appendChild(formatoCell);
            row.appendChild(unidadesCell);
            row.appendChild(precioUdCell);
            row.appendChild(ivaCell);
            row.appendChild(importeTotal);

            table.appendChild(row);
        });

        document.getElementById('DetallePedidoModal').show();
    }

    function descargaDocumento(idFactura,botonDescargar) {
        (async () => {
            //botonDescargar.classList.remove('link');
            botonDescargar.disabled = true;
            showLoading(botonDescargar,true);
            console.log('descargaDocumento idFactura:',idFactura);

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    'idFactura':idFactura,
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            fetch('/apps/upango-posventa/consulta_documento_factura/', fetchOptions).then(response => {
                if (!response.ok) {
                    //TODO: Mostar error
                    throw new Error(`Error en la respuesta: ${response.status} - ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                //botonDescargar.classList.add('link');
                botonDescargar.disabled = false;
                showLoading(botonDescargar,false);
                window.open(blobUrl, '_blank');
            })
            .catch(error => {
                //botonDescargar.classList.add('link');
                botonDescargar.disabled = false;
                showLoading(botonDescargar,false);
                //TODO: Mostrar error
                console.error('Error al obtener el PDF:', error);
            });

        })();
    }

    document
        .querySelector("#posventa-facturas-form")
        .addEventListener("submit", function(event){
            event.preventDefault();
            consultaFacturas();
        });

    //Busqueda inicial
    document.addEventListener("DOMContentLoaded", function(){
        var fechaDesdeInput = document.getElementById('fechaDesde');
        var fechaHastaInput = document.getElementById('fechaHasta');

        var fechaDesdeValue = fechaDesdeDefaultValue();
        var fechaHastaValue = fechaHastaDefaultValue();

        fechaDesdeInput.value = fechaDesdeValue;
        fechaHastaInput.value = fechaHastaValue;

        consultaFacturas();
    });

})();