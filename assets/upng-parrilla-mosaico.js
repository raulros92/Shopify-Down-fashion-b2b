//(function(){
const btn_tabla = document.querySelectorAll('.boton-tabla');
const btn_mosaico = document.querySelectorAll('.boton-mosaico');
const classVistaTabla = 'vista-tabla';
const classVistaMosaico = 'vista-mosaico';
const modoVistaListadosTabla = 'tabla';
const modoVistaListadosMosaico = 'mosaico';
const localStorageItemVistaPreferida = 'vistaPreferida';

//Comprobación de preferencia de vista (tabla o mosaico)
function initListViewParrillaMosaico() {
  let vistaPreferida = localStorage.getItem(localStorageItemVistaPreferida);
  // console.log('vistaPreferida: ' + vistaPreferida);
  if (vistaPreferida == modoVistaListadosMosaico) {
    cambiarVistaListados(modoVistaListadosMosaico);
  } else {
    //vista por defecto
    cambiarVistaListados(modoVistaListadosTabla);
  }
}

//modo: "mosaico"|"tabla"
function cambiarVistaListados(modo) {
  // console.log('cambiar vista');
  let div_tabla = document.getElementsByClassName(classVistaTabla)[0];
  let div_mosaico = document.getElementsByClassName(classVistaMosaico)[0];
  if (modo == modoVistaListadosMosaico) {
    div_tabla.style.display = 'none';
    div_mosaico.style.display = 'block';
    btn_mosaico.forEach((btn) => {
      btn.classList.add('selected');
    });
    btn_tabla.forEach((btn) => {
      btn.classList.remove('selected');
    });
  }
  //vista por defecto "tabla"
  else {
    div_mosaico.style.display = 'none';
    div_tabla.style.display = 'block';
    btn_tabla.forEach((btn) => {
      btn.classList.add('selected');
    });
    btn_mosaico.forEach((btn) => {
      btn.classList.remove('selected');
    });
  }
  localStorage.setItem(localStorageItemVistaPreferida, modo);
}

//EventListeners
// console.log('clicks!');
btn_mosaico.forEach((btn) => {
  btn.addEventListener('click', () => cambiarVistaListados(modoVistaListadosMosaico));
});
btn_tabla.forEach((btn) => {
  btn.addEventListener('click', () => cambiarVistaListados(modoVistaListadosTabla));
});

initListViewParrillaMosaico();
//})();
