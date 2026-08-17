// Simulación de energía solar
function simulateSolarEnergy() {
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(sun);
  
  // Animar el sol a lo largo del día
  function animateSun() {
    const hours = (Date.now() / 1000) % 86400 / 3600;
    const angle = (hours / 24) * Math.PI * 2;
    
    sun.position.x = Math.cos(angle) * 100;
    sun.position.z = Math.sin(angle) * 100;
    sun.position.y = 50 + Math.sin(angle) * 20;
    
    // Mostrar generación de energía
    const energyGenerated = calculateEnergy(hours);
    updateEnergyDisplay(energyGenerated);
    
    requestAnimationFrame(animateSun);
  }
  
  animateSun();
}

// Función para calcular energía generada
function calculateEnergy(hours) {
  // Lógica para calcular energía según hora del día
  if (hours >= 6 && hours <= 18) {
    return 100 * (Math.sin((hours - 6) * Math.PI / 12) * 0.8 + 0.2);
  } else {
    return 0;
  }
}

// Actualizar display de energía
function updateEnergyDisplay(energy) {
  document.getElementById('energy-display').textContent = 
    `Energía generada: ${Math.round(energy)} kW`;
}