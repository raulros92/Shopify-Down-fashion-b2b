const API_URL = 'apps/upango_documentos';
let userid = '';
// Hay una posibilidad de que el token no exista.
if (__st.cid) {
  userid = __st.cid;
}
let current_path = '';
// const userid = ShopifyAnalytics.lib.user().traits().uniqToken

// Esta función usa un truco para renombrar el blob que vamos a descargar.
// Para esto creamos un elemento <a> con la URL del blob y el atributo download con el nombre que queremos usar para el blob.
function saveBlobRename(blobURL, name) {
  // Creamos un elemento <a>
  let a = document.createElement('a');
  document.body.appendChild(a);
  // Hacemos el elemento invisible
  a.style.display = 'none';
  // El elemento tiene la URL del blob.
  a.href = blobURL;
  // Renombramos el blob.
  a.download = name;
  // Hacemos click en el blob.
  a.click();
}

async function fetchFiles(path = '') {
  // Podemos acceder a cada una de las carpetas usando API_URL/Folder1 o API_URL/Folder1/Folder2, etc.
  // Ahora que lo pienso, podríamos mover todo esto al body del post.
  const req = await fetch(window.Shopify.routes.root + API_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: userid,
      path: path,
    }),
  });
  try {
    const res = await req.json();
    return res;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function requestFile(path, file) {
  const req = await fetch(window.Shopify.routes.root + API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: userid,
      path: path,
      file: file,
    }),
  });
  try {
    console.log(req);
    if (req.status != 200) return console.error('Server could not find file');
    const res = await req.blob();
    const blobURL = URL.createObjectURL(res);
    saveBlobRename(blobURL, file);
    //window.open(blobURL, '_blank');
  } catch (error) {
    console.error(error);
    return error;
  }
}

function writeFiles(container, files, route) {
  // No, no puedo hacer este archivo .liquid y hacer un {% render 'icon-loquesea', no me deja, liquid no permite usar render en este contexto %}
  // Idealmente hay que cambiar estos iconos por algo más apropiado.
  container.innerHTML += `<p><b>Mostrando: ${files.length} resultados<b></p><hr>`;
  if (files.length == 0) {
    container.innerHTML = 'La carpeta está vacía/No existe';
    return;
  }
  files.forEach((file) => {
    let icon = `<svg class = "svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/></svg>`;
    let fileHTML = `<div class="flex-container file-container">
      <div class="icon-snippet">
        ${icon} 
      </div>
      <div><p class="file link button-label">${file.name}</p></div>
    </div>`;
    if (file.type == 'folder') {
      icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"/></svg>`;
      fileHTML = `<div class="flex-container file-container">
      <div class="icon-snippet">
        ${icon} 
      </div>
      <div><p class="folder link button-label">${file.name}</p></div>
    </div>`;
    }
    container.innerHTML += fileHTML;
  });
}

// Le pasamos una ruta como /Folder1/Folder2 indicando la carpeta que queremos acceder
async function loadFilesFromAPI(route = '') {
  current_path = route;
  const filesContainer = document.getElementById('files-container');
  filesContainer.innerHTML = '';
  try {
    const response = await fetchFiles(route);
    writeFiles(filesContainer, response.files, route);
  } catch (error) {
    console.error(error);
    filesContainer.innerHTML = 'ERROR: Archivos no encontrados';
  }
  const folders = filesContainer.getElementsByClassName('folder');
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    folder.addEventListener('click', () => {
      loadFilesFromAPI(`${route}/${folder.innerHTML}`);
    });
  }
  const files = filesContainer.getElementsByClassName('file');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    file.addEventListener('click', () => {
      console.log('User clicked on file');
      requestFile(current_path, file.innerHTML);
    });
  }
}

loadFilesFromAPI();
document.querySelector('#backButton').addEventListener('click', () => {
  if (current_path == '') return;
  let rutaArr = current_path.split('/');
  rutaArr.pop();
  if (rutaArr.length == 1) current_path = '';
  else current_path = rutaArr.join('/');
  loadFilesFromAPI(current_path);
});
