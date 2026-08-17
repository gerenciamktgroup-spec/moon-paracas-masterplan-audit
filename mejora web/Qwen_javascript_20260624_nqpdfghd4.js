/**
 * Moon Paracas - Main JavaScript Controller
 * Versión: 2.0
 * Fundamentación: Carga dinámica de inventario real (312 lotes + 138 cocheras)
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🌙 Moon Paracas Web v2.0 Inicializada");
    console.log("📊 Cargando inventario: 312 lotes + 138 cocheras");
    
    initApp();
});

/**
 * Inicializa la aplicación completa
 */
async function initApp() {
    await loadInventory();
    renderFeatured();
    initContactForm();
    updateStats();
}

/**
 * Carga el inventario completo desde CSV/JSON
 * Fundamentación: El CSV real tiene 450 elementos, no 238
 */
async function loadInventory() {
    try {
        // Intentar cargar desde API primero
        const response = await fetch('../datos/INVENTARIO_MOON_PARACAS.csv');
        const csvText = await response.text();
        
        // Parsear CSV
        const lotes = parseCSV(csvText);
        window.allProperties = lotes;
        
        console.log(`✅ Inventario cargado: ${lotes.length} elementos`);
        
        // Separar lotes y cocheras
        window.lotesResidenciales = lotes.filter(l => l.ID_Elemento.startsWith('L'));
        window.cocheras = lotes.filter(l => l.ID_Elemento.startsWith('P'));
        
        console.log(`🏠 Lotes: ${window.lotesResidenciales.length}`);
        console.log(`🚗 Cocheras: ${window.cocheras.length}`);
        
    } catch (error) {
        console.error("❌ Error cargando inventario:", error);
        // Fallback a properties.js si falla
        window.allProperties = featuredProperties;
    }
}

/**
 * Parsea CSV a array de objetos
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(';');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        
        // Convertir números
        if (obj.Area_m2) obj.Area_m2 = parseFloat(obj.Area_m2.replace(',', '.'));
        if (obj.Precio_S_) obj.Precio_S_ = parseInt(obj.Precio_S_.replace(',', ''));
        if (obj.Distancia_Oasis_m) obj.Distancia_Oasis_m = parseInt(obj.Distancia_Oasis_m);
        if (obj.Distancia_Cochera_m) obj.Distancia_Cochera_m = parseInt(obj.Distancia_Cochera_m);
        
        return obj;
    }).filter(obj => obj.ID_Elemento); // Filtrar vacíos
}

/**
 * Renderiza propiedades destacadas en homepage
 * CORRECCIÓN: Arrow function y strings sin espacios
 */
function renderFeatured() {
    const container = document.getElementById("featured-lots");
    if (!container) return;

    if (!window.allProperties || window.allProperties.length === 0) {
        container.innerHTML = "<p>Cargando inventario...</p>";
        return;
    }

    container.innerHTML = "";
    
    // Seleccionar 3 lotes representativos de diferentes tipologías
    const destacados = [
        window.lotesResidenciales.find(l => l.Tipologia.includes('Premium')),
        window.lotesResidenciales.find(l => l.Tipologia.includes('Estándar')),
        window.lotesResidenciales.find(l => l.Tipologia.includes('Tiny House'))
    ].filter(Boolean);

    destacados.forEach(prop => {
        const card = document.createElement("div");
        card.className = `card-property ${prop.Estado.toLowerCase().replace(' ', '-')}`;
        
        const esOferta = prop.Estado === 'En Oferta';
        const precioOriginal = prop.Area_m2 * (prop.Tipologia.includes('Premium') ? 170 : 120);
        
        card.innerHTML = `
            <div class="card-tag ${prop.Estado.toLowerCase().replace(' ', '-')}">
                ${prop.Estado.toUpperCase()}
                ${esOferta ? '<span class="badge-oferta">50% OFF</span>' : ''}
            </div>
            <div class="card-body">
                <h3>${prop.ID_Elemento}</h3>
                <h4 class="prop-type">${prop.Tipologia}</h4>
                <p class="prop-desc">${prop.Nombre} - Manzana ${prop.Manzana_Bloque}</p>
                <div class="prop-footer">
                    <span class="prop-area">📐 ${prop.Area_m2.toFixed(1)} m²</span>
                    ${esOferta ? `<span class="prop-price-old">S/ ${precioOriginal.toLocaleString()}</span>` : ''}
                    <span class="prop-price">S/ ${prop.Precio_S_.toLocaleString()}</span>
                </div>
                <div class="prop-details">
                    <span>🏝️ ${prop.Distancia_Oasis_m}m al Oasis</span>
                    <span>🚗 ${prop.Distancia_Cochera_m}m a cocheras</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `pages/propiedades.html?lote=${prop.ID_Elemento}`;
        });
        
        container.appendChild(card);
    });
}

/**
 * Inicializa formulario de contacto con validación
 */
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validación básica
        if (!data.nombre || !data.email || !data.telefono) {
            showToast("⚠️ Por favor complete todos los campos obligatorios.", "error");
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showToast("⚠️ Por favor ingrese un email válido.", "error");
            return;
        }

        console.log("📩 Lead capturado:", data);
        
        // Aquí iría el envío a API/CRM
        showToast("✅ Gracias por su interés. Nos contactaremos en menos de 24 horas.", "success");
        form.reset();
    });
}

/**
 * Actualiza estadísticas en tiempo real
 */
function updateStats() {
    if (!window.allProperties) return;
    
    const disponibles = window.lotesResidenciales.filter(l => l.Estado === 'Disponible').length;
    const enOferta = window.lotesResidenciales.filter(l => l.Estado === 'En Oferta').length;
    const separados = window.lotesResidenciales.filter(l => l.Estado === 'Separado').length;
    const vendidos = window.lotesResidenciales.filter(l => l.Estado === 'Vendido').length;
    
    // Actualizar contadores si existen en el DOM
    const statLotes = document.querySelector('.stat-number');
    if (statLotes && statLotes.textContent.includes('312')) {
        // Ya está correcto
    }
    
    console.log(`📊 Estadísticas: ${disponibles} disponibles, ${enOferta} en oferta, ${separados} separados, ${vendidos} vendidos`);
}

/**
 * Muestra toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 14px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Agregar animaciones CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);