// Spline - Visualización Arquitectónica
import { Spline } from '@splinetool/viewer';

const viewer = new Spline({
  canvas: document.getElementById('spline-canvas'),
  scene: 'https://prod.spline.design/xxxxx/scene.splinecode'
});

// Permitir personalización
viewer.on('ready', () => {
  // Configurar parámetros personalizables
  viewer.setParam('color', '#c5a880');
  viewer.setParam('material', 'adobe');
  
  // Escuchar cambios de diseño
  document.getElementById('color-selector').addEventListener('change', (e) => {
    viewer.setParam('color', e.target.value);
  });
  
  document.getElementById('material-selector').addEventListener('change', (e) => {
    viewer.setParam('material', e.target.value);
  });
});