(function () {
    function consultaAlbaranes() {
        (async () => {
            const form = document.getElementById('posventa-albaranes-form');
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

            const response = await fetch('/apps/upango-posventa/consulta_albaranes/', fetchOptions);
            if(checkResponseOk(response)){
                const jsonData = await response.json();
                console.log("consulta_albaranes jsonData: " + jsonData);

                checkErrorsInPosventaResponse(jsonData)
                
                if(jsonData.data!=null && jsonData.data.albaranes!=null){
                    const albaranes = jsonData.data.albaranes;
                    //Mostrar albaranes
                    showAlbaranes(albaranes);
                }
            }
            showLoading(button,false);
        })();
    }

    function showAlbaranes(albaranes) {
        console.log('showAlbaranes');
        const table = document.querySelector("#albaranes-table tbody");

        //Vacio la tabla
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        albaranes.forEach((albaran) => {
            
            const row = document.createElement("tr");
            
            //row.appendChild(buildResultCell(albaran.serie,theadTitles.serie));
            row.appendChild(buildResultCell(albaran.numAlbaran,theadTitles.numero));
            row.appendChild(buildResultCell(albaran.fecha,theadTitles.fecha,'Date'));
            row.appendChild(buildResultCell(albaran.agencia,theadTitles.agencia));
            row.appendChild(buildResultCell(albaran.estado,theadTitles.estado,'Status'));
            row.appendChild(buildResultCell(albaran.numSeguimiento,theadTitles.numeroSeguimiento));
            row.appendChild(buildResultCell(albaran.importe,theadTitles.total,'Money'));

            const idBotonDescargaDocumento = "descarga-documento-"+albaran.id;
            row.appendChild(descargarDocumentoCell(idBotonDescargaDocumento));

            table.appendChild(row);

            const botonDescargar = document.querySelector("#"+ idBotonDescargaDocumento);
            botonDescargar.addEventListener("click", (event) => {
                event.preventDefault();
                descargaDocumento(albaran.id,botonDescargar);
            });
        });

        document.getElementById('numero-resultados-consulta-posventa').innerHTML=albaranes.length;
    }

    function descargaDocumento(idAlbaran,botonDescargar) {
        (async () => {
            botonDescargar.disabled = true;
            showLoading(botonDescargar,true);

            console.log('descargaDocumento idAlbaran:',idAlbaran);

            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    'idAlbaran':idAlbaran,
                    'shop':Shopify.shop,
                    'customer':__st.cid,
                })
            };

            fetch('/apps/upango-posventa/consulta_documento_albaran/', fetchOptions).then(response => {
                if (!response.ok) {
                    //TODO: Mostar error
                    throw new Error(`Error en la respuesta: ${response.status} - ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                botonDescargar.disabled = false;
                showLoading(botonDescargar,false);
                window.open(blobUrl, '_blank');
            })
            .catch(error => {
                botonDescargar.disabled = false;
                showLoading(botonDescargar,false);
                //TODO: Mostrar error
                console.error('Error al obtener el PDF:', error);
            });

        })();
    }

    document
        .querySelector("#posventa-albaranes-form")
        .addEventListener("submit", function(event){
            event.preventDefault();
            consultaAlbaranes();
        });

    //Busqueda inicial
    document.addEventListener("DOMContentLoaded", function(){
        var fechaDesdeInput = document.getElementById('fechaDesde');
        var fechaHastaInput = document.getElementById('fechaHasta');

        var fechaDesdeValue = fechaDesdeDefaultValue();
        var fechaHastaValue = fechaHastaDefaultValue();

        fechaDesdeInput.value = fechaDesdeValue;
        fechaHastaInput.value = fechaHastaValue;

        consultaAlbaranes();
    });

})();