# 🌕 MOON PARACAS — Masterplan Interactivo & Plataforma Comercial

Proyecto integral de desarrollo ecológico de baja densidad y glamping de domos geodésicos en Paracas, Ica, Perú (~11 Hectáreas, 282 lotes en 4 Aldeas + Oasis Central de 5,000 m²).

---

## 📌 Documento Clave para Auditoría / Otras IAs
👉 **Consulte el archivo [`AUDITORIA_MASTERPLAN_Y_SISTEMA_MOON_PARACAS.md`](./AUDITORIA_MASTERPLAN_Y_SISTEMA_MOON_PARACAS.md)** para el desglose técnico completo, evolución arquitectónica, diagnósticos de geometría del masterplan, estructura de datos y roadmap.

---

## 📂 Estructura del Repositorio

- **`AUDITORIA_MASTERPLAN_Y_SISTEMA_MOON_PARACAS.md`**: Dossier técnico completo con análisis del mapa interactivo, benchmark de *Condominios Renacer*, fórmulas de precios y guía de reconstrucción.
- **`web mon/`**: Aplicación web frontend (React 18 + TypeScript + Vite + Tailwind CSS + Firebase + Lucide Icons).
  - `src/components/map/`: Componentes del Masterplan 2D (`MapCanvas.tsx`, `LotsLayer.tsx`, `MoonParacasMap.tsx`).
  - `src/lib/`: Motores de geometría, modelos de Aldeas y polígonos.
  - `src/pages/`: Simulador de inversiones, Centro Documental, Memoria Técnica, Galería y Experiencia.
- **`1.svg`**: Plano técnico vectorial 2D en alta resolución (viewBox `0 0 1500 1500`).
- **`lots_data.json` / `INVENTARIO_MOON_PARACAS.csv`**: Base de datos de los 282 lotes con metrajes, precios y estados.
- **Documentación Legal & Comercial**: Minutas, contratos de posesión, estatutos y plan financiero en formato `.docx` y `.pdf`.

---

## 🚀 Cómo Ejecutar la Aplicación Localmente

```bash
# Ingresar al directorio de la aplicación web
cd "web mon"

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev
```

---

## 🌐 Despliegue en Producción
- **URL Activa**: [https://moon-paracas.vercel.app](https://moon-paracas.vercel.app)
