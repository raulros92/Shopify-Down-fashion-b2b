document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('form_exportar_ficha_producto').addEventListener('submit', function (event) {
        event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional
        enviarFormularioExportadorFichaProducto();

    });
});


function showExportCatalogoErrors(errorMessages) {
    const errorMessagesParentElement = document.getElementById("exportar-ficha-producto-result");
    showErrorMessages(errorMessagesParentElement, errorMessages);
}

function showExportCatalogoResult(messages) {
    const errorMessagesParentElement = document.getElementById("exportar-ficha-producto-result");
    showInfoMessages(errorMessagesParentElement, messages);
}

function enviarFormularioExportadorFichaProducto() {
    //Activamos el loading en el button submit
    const buttonSubmitExportador = document.getElementById('submitButtonExportarFicha'); // Recupera el botón por su id

    const formulario = document.getElementById('form_exportar_ficha_producto');
    const formData = new FormData(formulario);

    // Convertir producto_info a una cadena JSON
    const producto_info_string = JSON.stringify(producto_info);

    // Agrega el atributo 'shop' al objeto FormData
    formData.append('shop', shop);

    // Agrega los atributos al objeto FormData
    formData.append('infoProducto', producto_info_string);

    // Muestra los datos en la consola o realiza cualquier otra acción
    for (const pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
    }

    fetch('/apps/upango_exportador_catalogo/ficha_producto', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, muestra un mensaje
                console.log('La solicitud se procesó correctamente.');
                showExportCatalogoResult([locales.alert_ok]);
                return response.blob(); // Convertir la respuesta a un Blob
            } else {
                // Si la respuesta no es exitosa, muestra un mensaje de error
                console.error('Error en la respuesta:', response.statusText);
                showExportCatalogoErrors([locales.alert_respuesta_mal]);
            }
        })
        .then(blob => {
            // Crear un enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${shop}_${producto_info.title.value}.pdf`; // Nombre de archivo para descargar
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            // Puedes manejar errores aquí, por ejemplo, mostrar un mensaje al usuario
            showExportCatalogoErrors([locales.alert_fallo]);
        })

}