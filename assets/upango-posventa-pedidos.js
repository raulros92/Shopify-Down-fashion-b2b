(function () {
    function consultaPedidos() {
        (async () => {
            const form = document.getElementById('posventa-pedidos-form');
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

            const response = await fetch('/apps/upango-posventa/consulta_pedidos/', fetchOptions);
            if(checkResponseOk(response)){
                const jsonData = await response.json();
                console.log("consulta_pedidos jsonData: " + jsonData);

                checkErrorsInPosventaResponse(jsonData)
                
                if(jsonData.data!=null && jsonData.data.pedidos!=null){
                    const pedidos = jsonData.data.pedidos;
                    showPedidos(pedidos);
                }
            }
            showLoading(button,false);

        })();
    }

    function showPedidos(pedidos) {
        console.log('showPedidos');
        const table = document.querySelector("#pedidos-table tbody");

        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        //Creo nuevas celtas
        pedidos.forEach((pedido) => {
            const row = document.createElement("tr");

            //row.appendChild(buildResultCell(pedido.serie,theadTitles.serie));
            row.appendChild(buildResultCell(pedido.numPedido,theadTitles.referenciaPedido));
            row.appendChild(buildResultCell(pedido.fecha,theadTitles.fecha,'Date'));
            row.appendChild(buildResultCell(pedido.estado,theadTitles.estado,'Status'));
            row.appendChild(buildResultCell(pedido.importe,theadTitles.total,'Money'));

            const idBotonVerDetalle = "ver-pedido-"+pedido.id;
            row.appendChild(verDetalleCell(idBotonVerDetalle,verDetalleText));

            table.appendChild(row);

            document
                .querySelector("#"+ idBotonVerDetalle)
                .addEventListener("click", (event) => {
                    event.preventDefault();
                    consultaLineas(pedido.id);
                });
        });

        document.getElementById('numero-resultados-consulta-posventa').innerHTML=pedidos.length;
    }

    function consultaLineas(idPedido) {
        (async () => {
            console.log('consultaLineas idPedido:',idPedido);

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    'idPedido':idPedido,
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            const response = await fetch('/apps/upango-posventa/consulta_lineas_pedido/', fetchOptions);
            const jsonData = await response.json();
            console.log("consulta_pedidos jsonData: " + jsonData);

            //TODO: Comprobar si hay errores y mostrar mensaje en ese caso
            const lineas = jsonData.data.lineas;

            //Mostrar pedidos
            showLineasPedido(lineas);

        })();
    }

    function showLineasPedido(lineas) {
        console.log('showLineasPedidos');
        const table = document.querySelector("#lineas-posventa-table tbody");

        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        lineas.forEach((linea) => {
            const row = document.createElement("tr");

            const nombreProductoCell = document.createElement("td");
            const referenciaProductoCell = document.createElement("td");
            const formatoCell = document.createElement("td");
            const unidadesCell = document.createElement("td");
            const precioUdCell = document.createElement("td");
            const ivaCell = document.createElement("td");
            const importeTotal = document.createElement("td");

            // Añado la clase a la celda de referenciaProductoCell
            referenciaProductoCell.classList.add('referenciaProductoCell');


            nombreProductoCell.textContent = linea.producto;
            referenciaProductoCell.textContent = linea.idProducto;
            formatoCell.textContent = linea.formato;
            unidadesCell.textContent = linea.unidades;
            precioUdCell.textContent = formatMoney(linea.precioUd);
            ivaCell.textContent = formatMoney(linea.iva);
            importeTotal.textContent = formatMoney(linea.importeTotal);

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

    document
        .querySelector("#posventa-pedidos-form")
        .addEventListener("submit", function(event){
            event.preventDefault();
            consultaPedidos();
        });

    //Busqueda inicial
    document.addEventListener("DOMContentLoaded", function(){
        var fechaDesdeInput = document.getElementById('fechaDesde');
        var fechaHastaInput = document.getElementById('fechaHasta');

        var fechaDesdeValue = fechaDesdeDefaultValue();
        var fechaHastaValue = fechaHastaDefaultValue();

        fechaDesdeInput.value = fechaDesdeValue;
        fechaHastaInput.value = fechaHastaValue;

        consultaPedidos();
    });

})();