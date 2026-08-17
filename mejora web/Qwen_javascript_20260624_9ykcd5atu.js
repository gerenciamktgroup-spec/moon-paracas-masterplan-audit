// Actualizar colores según estado
function updateLoteColors() {
  const lotes = document.querySelectorAll('.lote-3d');
  lotes.forEach(lote => {
    const estado = lote.dataset.estado;
    let color;
    
    switch(estado) {
      case 'disponible':
        color = '#4caf50';
        break;
      case 'en_oferta':
        color = '#e91e63';
        break;
      case 'separado':
        color = '#ff9800';
        break;
      case 'vendido':
        color = '#f44336';
        break;
      default:
        color = '#999999';
    }
    
    // Aplicar color al modelo 3D
    lote.style.fill = color;
    lote.style.stroke = color;
  });
}

// Llamar cuando los datos se carguen
document.addEventListener('DOMContentLoaded', updateLoteColors);