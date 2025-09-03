// Seleccionar el botón y el contador
const counterElement = document.getElementById('counter');
const incrementButton = document.getElementById('increment-btn');

// Inicializar el contador
let count = 0;

// Agregar un evento al botón
incrementButton.addEventListener('click', () => {
  count++;
  counterElement.textContent = count;
});