# 📋 DOSSIER TÉCNICO DE AUDITORÍA Y ARQUITECTURA INTEGRAL
## PROYECTO: MOON PARACAS — MASTERPLAN INTERACTIVO Y HERRAMIENTAS COMERCIALES
**Fecha de generación:** Agosto 2026  
**Destinatario:** Auditor Técnico / Ingeniero de Software / Agente de IA para Auditoría y Continuidad  
**Repositorio Principal:** `c:\Users\LENOVO\Desktop\paracas condo`  
**Aplicación Web:** `c:\Users\LENOVO\Desktop\paracas condo\web mon`  

---

## 📑 ÍNDICE GENERAL DEL DOSSIER

1. **RESUMEN EJECUTIVO Y OBJETIVO DEL PROYECTO**
2. **MAPA Y ESTRUCTURA GENERAL DEL REPOSITORIO**
   - 2.1. Documentación Legal, Comercial y Financiera (Raíz)
   - 2.2. Activos Gráficos, Renders y Planos Maestros
   - 2.3. Bases de Datos e Inventarios Técnicos
   - 2.4. Estructura de la Aplicación Web Frontend (`/web mon`)
3. **EVOLUCIÓN Y ANÁLISIS CRÍTICO DEL MASTERPLAN INTERACTIVO**
   - 3.1. Fase 1: Generación Procedural y Matemática Pura (`v1` - `v2.2`)
   - 3.2. Fase 2: Cuatro Aldeas y Superposición de Render 3D Isométrico (`v3` - `v4`)
   - 3.3. Fase 3: Grilla de Cuadriláteros Interpolados (`alignedLotGeometry.ts`)
   - 3.4. Fase 4: Auditoría del Benchmark Industrial (Caso *Condominios Renacer*)
4. **DIAGNÓSTICO DE ERRORES Y DISCREPANCIAS TÉCNICAS ACTUALES**
   - 4.1. El conflicto entre proyección Isométrica 3D y Espacio Vectorial 2D
   - 4.2. Desfase de polígonos vs. medidas reales de planos
   - 4.3. Duplicidad de capas e interfaces HUD
5. **ARQUITECTURA DE DATOS Y REGLAS DE NEGOCIO**
   - 5.1. Esquema de Lotes y Tipologías
   - 5.2. Modelo Financiero, Precios y Domos Geodésicos
   - 5.3. Estados de Lotes y Sincronización en Tiempo Real (Firebase)
6. **DESGLOSE COMPONENTE POR COMPONENTE DEL FRONTEND**
   - 6.1. Núcleo del Mapa (`MapCanvas`, `LotsLayer`, `MoonParacasMap`)
   - 6.2. Herramientas Comerciales (`Simulator.tsx`, `RightPanel.tsx`, `FiltersBar.tsx`)
   - 6.3. Módulos Complementarios (`Legal.tsx`, `Technical.tsx`, `Experience.tsx`)
7. **GUÍA PASO A PASO PARA LA RECONSTRUCCIÓN FINAL (INSTRUCCIONES PARA OTRA IA)**

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DEL PROYECTO

**Moon Paracas** es un desarrollo inmobiliario ecológico y de glamping privado de baja densidad ubicado en Paracas, Ica, Perú (~11 Hectáreas).
El desarrollo contempla **282 lotes residenciales** distribuidos en **4 Aldeas / Manzanas** alrededor de un **Oasis Central de 5,000 m²** (Club House, piscina/laguna, amenidades zen y áreas deportivas), integrando arquitectura de **domos geodésicos (Ø4m y Ø8m)**.

### Objetivo Técnico del Sistema:
Construir una plataforma web interactiva y comercial de ultra lujo que incluya:
1. **Masterplan Interactivo Comercializable**: Un visor 2D/3D donde cada lote tenga sus dimensiones reales, esté exactamente delimitado, cambie visualmente según su estado comercial (*Disponible*, *Reservado*, *En Oferta*, *Vendido*, *Bloqueado*) y permita la selección y cotización directa.
2. **Simulador Financiero y Cotizador**: Cálculo de iniciales, cuotas mensuales y reserva por WhatsApp.
3. **Centro Documental y Legal**: Contratos de adhesión, posesión y reglamento interno.
4. **Visualizador de Domos Geodésicos**: Renders interactivos y especificaciones técnicas de habitabilidad.

---

## 2. MAPA Y ESTRUCTURA GENERAL DEL REPOSITORIO

### 2.1. Documentación Legal, Comercial y Financiera (Raíz)
* `01_Contrato_Incorporacion_y_Adjudicacion_Area_Uso_Exclusivo.docx`: Base legal de adjudicación de área exclusiva.
* `02_Anexo_Condiciones_Fase_0_Etapa_Fundadora.docx`: Condiciones para inversionistas fundadores.
* `03_Anexo_Cronograma_Obras_Hitos_Caja_Positiva.docx`: Planificación de obras e infraestructura.
* `04_Acuerdo_Aporte_Valorizacion_Pago_Terreno.docx`: Respaldo fiduciario y adquisición de tierra.
* `05_Contrato_Transferencia_Membresia.docx` a `09_Reglamento_Interno_Base.docx`: Normativa de convivencia y cesión.
* `ESTRATEGIA_Y_PLAN_FINANCIERO_CONSOLIDADO.docx` & `CUADRO_RESUMEN_PROYECTO.md`: Métricas financieras consolidadas.

### 2.2. Activos Gráficos, Renders y Planos Maestros
* `1.svg` (667 KB): **Plano vectorial 2D técnico principal** (viewBox `0 0 1500 1500`), generado con diagramación exacta de manzanas y parcelas.
* `1.jpg` / `2.jpg`: Renders de referencia del plano y visualización de aldeas.
* `11has paracas.kml`: Perímetro topográfico y polígono UTM real en Google Earth.
* `renacer_source.html` (145 KB): Código fuente extraído del benchmark *Condominios Renacer* para análisis de ingeniería inversa.
* `web mon/public/images/`:
  - `masterplan_3d.jpg` (356 KB): Render 3D artístico isométrico con las 4 Aldeas y el Oasis Central.
  - `masterplan_bg.png` (966 KB): Fondo base del masterplan en vista cenital/técnica.
  - `masterplan-v3-commercial.png` / `masterplan-v2.2-commercial.png`: Renders ortogonales previos.
  - `domo_ext_1.png`, `domo_int_1.png`, `paracas_dome_pool.png`: Renders de los domos geodésicos.

### 2.3. Bases de Datos e Inventarios Técnicos
* `lots_data.json` (120 KB, 5,402 líneas): Matriz de 282 lotes con ID (`LOTE-1` a `LOTE-282`), `blockId` (M1 a M4 / C1 a C4), `areaM2`, `pricePerM2`, `elevation`, `distanceToPool` y estado.
* `INVENTARIO_MOON_PARACAS.csv` (35 KB) & `MASTERPLAN_TECNICO_MOON_PARACAS.xlsx`: Hojas de cálculo con metrajes, frentes, fondos y precios.
* `web mon/src/data/lots_status.json`: Diccionario clave-valor con el estado en vivo de cada lote.

### 2.4. Estructura de la Aplicación Web (`/web mon`)
Tecnología: **React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Firebase Realtime DB + Vercel Deployment**.
```
web mon/
├── src/
│   ├── components/
│   │   ├── home/               # Hero, Value Props, Gallery, Contact
│   │   ├── map/                # NÚCLEO DEL MASTERPLAN INTERACTIVO
│   │   │   ├── layers/
│   │   │   │   ├── LotsLayer.tsx       # Renderizado de polígonos interactivos
│   │   │   │   └── RoadsLayer.tsx      # Capa de vías y senderos peatonales
│   │   │   ├── CustomSVGOverlay.tsx    # Superposiciones SVG
│   │   │   ├── DomeConceptPanel.tsx    # Panel de experiencia de domos
│   │   │   ├── DomeMap.tsx             # Mapa interactivo secundario
│   │   │   ├── FiltersBar.tsx          # Filtros (Estado, Manzana, Tipología)
│   │   │   ├── MapCanvas.tsx           # Motor de Pan, Zoom, Viewport y HUD
│   │   │   ├── mapVisuals.ts           # Paletas de color, estados y leyendas
│   │   │   ├── MoonParacasMap.tsx      # Contenedor padre del mapa
│   │   │   └── RightPanel.tsx          # Ficha técnica y botón WhatsApp del lote
│   │   └── layout/             # Header, Footer, Navigation
│   ├── config/
│   │   ├── pricing.ts          # Tarifarios por m², listas comerciales y reglas
│   │   └── project.ts          # Datos generales, contacto comercial y WhatsApp
│   ├── lib/                    # MOTORES DE GEOMETRÍA Y CÁLCULO
│   │   ├── alignedLotGeometry.ts      # Intento de grilla paramétrica (AUDITAR)
│   │   ├── constellationModel.ts       # Modelo procedural v2.2
│   │   ├── coordinates.ts              # Conversor UTM a espacio local
│   │   ├── courtyardMasterplanModel.ts # Modelo de 4 Aldeas (v4)
│   │   ├── geometry.ts                 # Algoritmos de centroides, áreas y polígonos
│   │   ├── organicConstellationModel.ts# Modelo de curvas orgánicas
│   │   ├── polygonOffset.ts            # Algoritmo de offsets y buffers de retiro
│   │   ├── salesModel.ts               # Filtros de inventario
│   │   └── terrainModel.ts             # Escalamiento del polígono UTM a viewBox SVG
│   ├── pages/
│   │   ├── DocumentCenter.tsx  # Descarga de contratos y minutas
│   │   ├── Experience.tsx      # Módulo de amenidades y estilo de vida
│   │   ├── Gallery.tsx         # Renders y fotografías del entorno
│   │   ├── Legal.tsx           # Respaldo jurídico y marco legal
│   │   ├── Simulator.tsx       # Simulador financiero y cotizador de cuotas
│   │   └── Technical.tsx       # Memoria descriptiva y planos
│   ├── types/
│   │   └── map.ts              # Definiciones TypeScript (Lot, Block, Scene, etc.)
│   ├── App.tsx
│   └── main.tsx
```

---

## 3. EVOLUCIÓN Y ANÁLISIS CRÍTICO DEL MASTERPLAN INTERACTIVO

Para que cualquier auditor o IA entienda la trayectoria del desarrollo, se resumen los 4 enfoques intentados y sus resultados:

### 3.1. Fase 1: Generación Procedural y Matemática Pura (`constellationModel.ts`)
* **Concepto:** A partir de los vértices UTM reales del terreno (`terrain.vertices`), se calculaban matemáticamente 6 sectores radiales concéntricos hacia el oasis.
* **Problema:** Producía un diagrama esquemático/vectorial abstracto que no representaba el plano urbanístico comercial real ni las manzanas requeridas.

### 3.2. Fase 2: Cuatro Aldeas con Fondo de Render 3D Isométrico (`courtyardMasterplanModel.ts`)
* **Concepto:** Se fijó el masterplan en 4 Aldeas cuadrangulares (C1, C2, C3, C4) alrededor del Oasis y se colocó de fondo un render 3D artístico (`masterplan_3d.jpg`).
* **Problema:** **Incompatibilidad de Proyección**. El render 3D tiene perspectiva cónica e isométrica (las casas del fondo son más pequeñas y las líneas fugan), mientras que el SVG genera proyecciones ortogonales planas 2D. Los polígonos vectoriales quedaban flotando y desfasados de las casas renderizadas.

### 3.3. Fase 3: Grilla de Cuadriláteros Interpolados (`alignedLotGeometry.ts`)
* **Concepto:** Se intentó crear una función de interpolación bilineal cuadrilátera (`getAlignedLotPolygon`) forzando a los lotes a encajar en una grilla de columnas y filas.
* **Problema:** Descartaba los polígonos reales calculados y producía cajas rectangulares genéricas que no correspondían a los anchos de vía, curvas de retorno ni a la numeración real del plano.

### 3.4. Fase 4: Auditoría del Benchmark (*Condominios Renacer Herradura*)
* **Hallazgo Clave de la Auditoría Técnica:**
  - *Renacer* **NO** calcula polígonos en el frontend en tiempo real.
  - *Renacer* **NO** usa Leaflet, ni Mapbox, ni proyecciones cartográficas complejas.
  - *Renacer* embebe una app web alojada en Azure (`https://satairanarenacerprod.z20.web.core.windows.net/map/la-herradura`) que utiliza:
    1. Una imagen de plano 2D estática de alta resolución de fondo.
    2. Polígonos SVG estáticos (`<path d="..." id="lote-XX">` o `<polygon points="...">`) dibujados **exactamente sobre el plano CAD/vectorial original**.
    3. Atributos de datos vinculados (`data-id`, `data-status`, `data-area`, `data-price`).
    4. Un visor con capacidad de Zoom / Pan (arrastrar y escalar) y eventos `onClick` / `onMouseEnter` que abren un modal lateral conectado a WhatsApp.

---

## 4. DIAGNÓSTICO DE ERRORES Y DISCREPANCIAS TÉCNICAS ACTUALES

Toda IA que continúe este trabajo debe conocer estos 3 problemas raíz:

1. **Desfase Geométrico Render vs. Vector:**
   - Si se usa una imagen de fondo 3D en perspectiva, no se pueden usar polígonos 2D ortogonales sin una matriz de deformación homográfica (homografía proyectiva 3D).
   - **Solución Correcta:** Utilizar el plano 2D técnico (`1.svg` / `masterplan_bg.png`) como base donde 1 metro o 1 pixel equivale a una coordenada plana constante.

2. **Divergencia entre `lots_data.json` y los IDs del Layout:**
   - En algunos archivos los lotes se identifican como `LOTE-1` a `LOTE-282`, con manzanas `M1`, `M2`, `M3`, `M4` o `C1`, `C2`, `C3`, `C4`.
   - Se debe estandarizar la nomenclatura: **Manzana (A, B, C, D o Aldea 1, 2, 3, 4) + Número de Lote (01 al N)**.

3. **Duplicación de Elementos HUD:**
   - La imagen `masterplan_3d.jpg` tenía textos impresos ("Información General", "Leyenda"). Cuando React renderizaba sus propias tarjetas HTML sobre la imagen, se creaba un efecto de duplicidad visual.
   - La interfaz interactiva debe controlar el 100% de los textos dinámicamente sobre un plano limpio sin leyendas incrustadas en el mapa base.

---

## 5. ARQUITECTURA DE DATOS Y REGLAS DE NEGOCIO

### 5.1. Esquema de Lotes (`Lot` Interface en `types/map.ts`)
```typescript
export interface Lot {
  id: string;                      // Ej: "LOTE-42" o "C1-L15"
  legacyId?: string;
  blockId: string;                 // "C1" (Aldea 1), "C2", "C3", "C4"
  projectId: string;               // "moon-paracas"
  number: number;                  // 15
  typology: LotTypology;           // "tiny-house" (120m2) | "standard" (180m2) | "premium" (240m2) | "parking"
  status: LotStatus;               // "available" | "reserved" | "offer" | "sold" | "blocked"
  areaM2: number;                  // Ej: 120.00
  polygon: XY[];                   // Array de puntos [{x: number, y: number}, ...] en espacio viewBox
  dimensions?: string;             // Ej: "8.00m frente × 15.00m fondo"
  price: number;                   // Precio en Soles (PEN)
  priceLabel?: string;             // Ej: "S/ 36,000"
  fitsDome4m?: boolean;            // Capacidad de domo Ø4m
  fitsDome8m?: boolean;            // Capacidad de domo Ø8m
  recommendedDomeDiameterM?: number;// 4 u 8
  distanceToPool?: number;         // Metros al Oasis Central
}
```

### 5.2. Tarifario Comercial Vigente (`config/pricing.ts`)
* **Lote Tiny House (120 m²)**: S/ 300 / m²  ➔  **S/ 36,000 PEN** (~$9,700 USD)
* **Lote Estándar (180 m²)**: S/ 320 / m²   ➔  **S/ 57,600 PEN** (~$15,500 USD)
* **Lote Premium Oasis (240 m²)**: S/ 350 / m² ➔ **S/ 84,000 PEN** (~$22,700 USD)
* **Cochera Privada Plus**: S/ 7,500 PEN
* **Facilidades de Pago**:
  - Inicial: 10% a 30%
  - Saldo: 12, 24, 36 o 48 cuotas fijas sin intereses (Fase 0 Founder).

### 5.3. Paleta de Colores de Estados (Norma Renacer)
* 🟢 **Disponible**: `rgba(62, 112, 77, 0.75)` / Borde `#60A373`
* 🟡 **Reservado**: `rgba(196, 143, 84, 0.80)` / Borde `#E2AA6E`
* 🟠 **En Oferta**: `rgba(200, 91, 62, 0.80)` / Borde `#F08264`
* 🔴 **Vendido**: `rgba(180, 50, 50, 0.75)` / Borde `#E57373`
* ⚪ **Bloqueado**: `rgba(43, 54, 52, 0.85)` / Borde `#455451`
* ✨ **Seleccionado**: `rgba(255, 215, 0, 0.85)` / Borde `#FFD700` con resplandor dorado.

---

## 6. DESGLOSE COMPONENTE POR COMPONENTE DEL FRONTEND

### 6.1. Motor del Mapa
1. **`MapCanvas.tsx`**:
   - Administra el contenedor SVG y el sistema de transformación interactivo (`transform: translate(x, y) scale(s)`).
   - Maneja eventos de ratón/táctiles: `onMouseDown`, `onMouseMove`, `onMouseUp`, `onWheel` (zoom in/out con inercia).
   - Controles de UI flotantes:
     - Barra superior de filtros por estado (*Todos*, *Disponibles*, *Reservados*, *En Oferta*, *Vendidos*).
     - Botones de salto rápido a sectores (*Aldea 1*, *Aldea 2*, *Aldea 3*, *Aldea 4*, *Oasis Central*).
     - Barra de navegación inferior (*Zoom +/-, Reset, Pan Arrows, Fullscreen*).
     - Selector de mapa base (*Masterplan Técnico* vs. *Vista Satelital*).
     - Drawer / Modal deslizante al seleccionar un lote.

2. **`LotsLayer.tsx`**:
   - Itera sobre `lots: Lot[]` y renderiza cada `<path d={pathFromPolygon(lot.polygon)} />`.
   - Inyecta eventos `onClick`, `onMouseEnter`, `onMouseLeave` y estilos reactivos de hover/focus.
   - Dibuja el número identificador del lote en el centroide de cada polígono.

3. **`MoonParacasMap.tsx`**:
   - Componente contenedor que conecta los filtros de búsqueda (`FiltersBar`) con el estado global.
   - Provee la barra de resumen de inventario (Total de lotes, cocheras, compatibilidad con domos de 8m).
   - Permite alternar entre la pestaña *"Plano Interactivo"* y *"Habitar el Lote (Domo Concept Panel)"*.

### 6.2. Herramientas Comerciales
1. **`Simulator.tsx` (Simulador de Cuotas e Inversión)**:
   - Permite al usuario seleccionar lote, monto de cuota inicial (10% a 50%) y plazo (12 a 48 meses).
   - Calcula la amortización en Soles (PEN) y Dólares (USD).
   - Genera el enlace directo a WhatsApp con el desglose financiero listo para el asesor comercial.

2. **`RightPanel.tsx`**:
   - Ficha técnica lateral que muestra metraje exacto, tipología, compatibilidad de domo, precio y botón CTA *"Contactar Asesor por WhatsApp"*.

---

## 7. GUÍA PASO A PASO PARA LA RECONSTRUCCIÓN FINAL (INSTRUCCIONES PARA OTRA IA)

Si eres una IA o ingeniero encargado de rehacer o perfeccionar el masterplan al estándar de *Condominios Renacer*, sigue esta **receta estricta**:

### Paso 1: Establecer el Plano Base Único
- Utilizar el archivo vectorial `1.svg` (o su render PNG/JPG de alta resolución a 1500×1500 px) como el **único fondo de coordenadas**.
- El `viewBox` del SVG interactivo en `MapCanvas.tsx` debe ser exactamente `0 0 1500 1500` (o las dimensiones exactas del SVG base).

### Paso 2: Extraer o Mapear los Polígonos de Lote Reales
- **NO usar algoritmos procedurales que recalculen el terreno desde cero.**
- Los polígonos deben ser extraídos directamente de las etiquetas `<path>` / `<polygon>` del archivo `1.svg` o definidos como coordenadas estáticas fijas en un archivo `lots_geometry_1500.json`.
- Cada lote en el JSON debe contener:
  ```json
  {
    "id": "LOTE-1",
    "block": "Aldea 1",
    "number": 1,
    "points": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]],
    "areaM2": 120.0,
    "dimensions": "8.00m x 15.00m",
    "status": "available",
    "pricePEN": 36000
  }
  ```

### Paso 3: Enlazar la Capa Interactiva en `LotsLayer.tsx`
- Mapear cada elemento del JSON a un `<polygon points="..." />` o `<path d="..." />` en SVG.
- Aplicar las clases y estilos de color según el `status` del lote.

### Paso 4: Validar la Sincronización en Tiempo Real
- Conectar el estado de disponibilidad con Firebase Realtime DB para que cuando ventas marque un lote como *Vendido* o *Reservado*, el polígono cambie instantáneamente de verde a rojo/dorado.

### Paso 5: Despliegue y Verificación
- Compilar con `npm run build` en `web mon/`.
- Validar que no existan advertencias de hidratación o solapamiento en `https://moon-paracas.vercel.app`.

---
*Fin del Dossier de Auditoría Técnica.*
