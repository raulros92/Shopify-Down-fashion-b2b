let checkbox_ModoDiscreto = document.querySelector('#modo-discreto');
let modoDiscreto = sessionStorage.getItem('modo-discreto') || 'false';

function ocultarPrecios() {
  if (modoDiscreto === 'true') {
    checkbox_ModoDiscreto.checked = true;
    let precios = document.querySelectorAll('.upng-price');
    precios.forEach((precio) => {
      //precio.textContent = "";
      precio.setAttribute('style', 'display: none;');
    });
  } else if (modoDiscreto === 'false') {
    checkbox_ModoDiscreto.checked = false;
    let precios = document.querySelectorAll('.upng-price');
    precios.forEach((precio) => {
      //precio.textContent = "";
      precio.setAttribute('style', '');
    });
  }
}

ocultarPrecios();

checkbox_ModoDiscreto.addEventListener('change', function nombre_provisional() {
  let modoDiscretoBooleano = modoDiscreto === 'true';
  modoDiscretoBooleano = !modoDiscretoBooleano;
  sessionStorage.setItem('modo-discreto', modoDiscretoBooleano.toString());
  modoDiscreto = modoDiscretoBooleano.toString();

  ocultarPrecios();
});

let mdObserver = new MutationObserver((x) => {
  ocultarPrecios();
});

// Configurar las opciones de observación
let mdConfig = {
  attributes: false, // Observa los cambios en los atributos
  childList: true, // Observa la adición/eliminación de hijos
  subtree: true, // Observa todo el subárbol del DOM
  characterData: false, // Observa los cambios en el contenido de texto
};

// Comenzar a observar el <body> con la configuración especificada
mdObserver.observe(document.body, mdConfig);
