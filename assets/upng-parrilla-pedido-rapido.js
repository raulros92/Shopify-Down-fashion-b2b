/**
 * @param {string} url
 * @param {HTMLButtonElement} btn
 * @returns
 */
async function modalVariantesParrilla(url, btn) {
  // Buscamos si ya se ha insertado un script de matriz.
  const oldScript = document.querySelector('#parrilla-matrix-script');
  if (oldScript) {
    // Si está insertado, lo borramos.
    oldScript.remove();
    // Dejamos las variables que necesita el script como undefined.
    if (typeof variant_matrix_container !== 'undefined') variant_matrix_container = undefined;
    if (typeof matrix_container_counter !== 'undefined') matrix_container_counter = undefined;
  }
  console.log(url);
  const modal = document.querySelector('#parrilla-pedido-rapido');
  // Si el modal no existe, no hagas nada
  if (!modal) return;
  const container = modal.querySelector('.modal-empty-container');
  // Para no reemplazar todo el modal, debe de haber un div vacío con la clase modal-empty-container.
  if (!container) return;
  // Limpiamos el contenedor antes de abrirlo.
  container.innerHTML = '';
  // Mostramos el spinner de carga.
  const spinner = btn.querySelector('.loading__spinner');
  if (spinner) spinner.classList.remove('hidden');
  // Obtener datos del producto.
  const req = await fetch(url);
  if (spinner) spinner.classList.add('hidden');
  if (!req.ok) return;
  const res = await req.text();
  const html = new DOMParser().parseFromString(res, 'text/html');
  // Obtener el div de pedido rápido de la página del producto.
  const matrix = html.querySelector('#matrix-container');
  // Si no hay matriz no hacemos nada.
  if (!matrix) return;
  // La matriz trae un h2 que no queremos.
  const title = matrix.querySelector('h2');
  if (title) title.remove();
  // Insertamos el HTML de la matriz dentro del HTML de nuestro modal.
  container.append(matrix);
  // Obtenemos los scripts de la matriz.
  const scripts = html.querySelectorAll('script');
  // Buscamos el script de la matriz.
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    // Inyectamos el script de la matriz.
    if (script.src.includes('upng-matriz-variantes')) {
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.type = 'text/javascript';
      newScript.id = 'parrilla-matrix-script';
      document.querySelector('head').append(newScript);
    }
  }
  // Una vez ha terminado todo, mostramos el modal.
  modal.show(btn);
}
