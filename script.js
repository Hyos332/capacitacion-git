// Seleccionar el botón y el contador
const counterElement = document.getElementById('counter');
const incrementButton = document.getElementById('increment-btn');

// Inicializar el contador
let count = 0;

// Agregar un evento al botón
incrementButton.addEventListener('click', () => {
  count += 2; // Incrementar el contador de 2 en 2
  counterElement.textContent = count;
});