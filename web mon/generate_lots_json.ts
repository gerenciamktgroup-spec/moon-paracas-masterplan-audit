import { buildMoonParacasInventory } from "./src/lib/masterplanInventory";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const { residentialLots: cleanLocalLots, parkings } = buildMoonParacasInventory();
  
  // Format data for generate_excel.py
  const excelLots: any[] = [];
  
  // Add residential lots
  cleanLocalLots.forEach(l => {
    // Determine typology label for Excel
    let typologyLabel = "Villas Estándar";
    if (l.typology === "premium") {
      typologyLabel = "Villas Premium (Oasis)";
    } else if (l.typology === "tiny-house") {
      typologyLabel = "Casas Compactas (Tiny House)";
    } else if (l.typology === "zen") {
      typologyLabel = "Aldeas Zen (Eco-Domo)";
    } else if (l.typology === "adjustment") {
      typologyLabel = "Villas de Borde (Ajuste)";
    }
    
    // Determine rate (price per m2) based on the same logic in lotModel.ts
    // Founding lots (1 to 35) rate = 300
    // Premium/Tiny-house = 450
    // Adjustment = 320
    // Standard/Zen = 380
    const pricePerM2 = l.status === "offer" ? 60 :
                       l.typology === "premium" ? 170 : 120;
                       
    excelLots.push({
      id: l.id,
      blockId: l.blockId,
      typologyLabel: typologyLabel,
      typology: l.typology,
      status: l.status,
      areaM2: l.areaM2,
      pricePerM2: pricePerM2,
      elevation: l.elevation,
      distanceToPool: l.distanceToPool,
      hubDistance: l.hubDistance
    });
  });
  
  // Add parkings
  parkings.forEach(p => {
    excelLots.push({
      id: p.id,
      blockId: p.blockId,
      typologyLabel: "Cochera Plus",
      typology: "parking",
      status: p.status,
      areaM2: p.areaM2,
      pricePerM2: 400, // 12.5 * 400 = 5000 S/
      elevation: p.elevation,
      distanceToPool: p.distanceToPool,
      hubDistance: p.hubDistance
    });
  });
  
  const outPath = path.resolve(__dirname, "../lots_data.json");
  fs.writeFileSync(outPath, JSON.stringify(excelLots, null, 2), "utf8");
  console.log(`Saved ${excelLots.length} items to lots_data.json at ${outPath}`);

  // Generate INVENTARIO_MOON_PARACAS.csv
  const csvHeaders = ["ID_Elemento", "Nombre", "Manzana_Bloque", "Tipologia", "Area_m2", "Dimensiones", "Precio_S/", "Distancia_Oasis_m", "Distancia_Cochera_m", "Estado"];
  const csvLines = [csvHeaders.join(";")];
  
  // Format residential lots
  cleanLocalLots.forEach(l => {
    const pricePerM2 = l.status === "offer" ? 60 :
                       l.typology === "premium" ? 170 : 120;
    const price = Math.round(l.areaM2 * pricePerM2);
    
    let typologyLabel = "Lote Estándar";
    if (l.typology === "premium") {
      typologyLabel = "Lote Premium (Oasis)";
    } else if (l.typology === "tiny-house") {
      typologyLabel = "Lote Tiny House";
    } else if (l.typology === "zen") {
      typologyLabel = "Lote Zen";
    } else if (l.typology === "adjustment") {
      typologyLabel = "Lote Ajuste (Irregular)";
    }
    
    let statusLabel = "Disponible";
    if (l.status === "offer") {
      statusLabel = "En Oferta";
    } else if (l.status === "sold") {
      statusLabel = "Vendido";
    } else if (l.status === "reserved" || l.status === "blocked") {
      statusLabel = "Separado";
    }
    
    const idElemento = "L" + l.number.toString().padStart(3, "0");
    const areaFormatted = l.areaM2.toFixed(2).replace(".", ",");
    
    csvLines.push([
      idElemento,
      "Lote " + l.number,
      l.blockId,
      typologyLabel,
      areaFormatted,
      l.dimensions || "",
      price.toString(),
      l.distanceToPool.toString(),
      l.hubDistance.toString(),
      statusLabel
    ].join(";"));
  });
  
  // Format parkings
  let pIdx = 1;
  parkings.forEach(p => {
    const idElemento = "P" + pIdx.toString().padStart(3, "0");
    pIdx++;
    
    let statusLabel = "Separado";
    if (p.status === "available") {
      statusLabel = "Disponible";
    } else if (p.status === "sold") {
      statusLabel = "Vendido";
    }
    
    csvLines.push([
      idElemento,
      p.number,
      "PARKING",
      "Cochera Plus",
      "12,50",
      "2.5m x 5.0m",
      "5000",
      p.distanceToPool.toString(),
      "0",
      statusLabel
    ].join(";"));
  });
  
  const csvContent = "\ufeff" + csvLines.join("\r\n");
  
  // Save INVENTARIO_MOON_PARACAS.csv locally in root and in artifacts
  const localCsvPath = path.resolve(__dirname, "../INVENTARIO_MOON_PARACAS.csv");
  const artifactCsvPath = "C:/Users/LENOVO/.gemini/antigravity/brain/ab20ce93-86b9-457a-acc5-4c6d65ea60c2/INVENTARIO_MOON_PARACAS.csv";
  
  try {
    fs.writeFileSync(localCsvPath, csvContent, "utf8");
    console.log(`Saved ${csvLines.length - 1} items to local CSV at ${localCsvPath}`);
  } catch (err) {
    console.error("Failed to write local CSV:", err);
  }
  
  try {
    if (fs.existsSync(path.dirname(artifactCsvPath))) {
      fs.writeFileSync(artifactCsvPath, csvContent, "utf8");
      console.log(`Saved ${csvLines.length - 1} items to artifact CSV at ${artifactCsvPath}`);
    }
  } catch (err) {
    console.error("Failed to write artifact CSV:", err);
  }

  // Generate cuadro_lotes_masterplan_v2.csv
  const v2Headers = ["Manzana", "Numero de Lote", "Area (m2)", "Tipologia", "Precio (S/)", "Distancia Oasis (m)", "Distancia Cochera (m)", "Estado"];
  const v2Lines = [v2Headers.join(";")];
  
  cleanLocalLots.forEach(l => {
    const pricePerM2 = l.status === "offer" ? 60 :
                       l.typology === "premium" ? 170 : 120;
    const price = Math.round(l.areaM2 * pricePerM2);
    
    let typologyLabel = "Lote Estándar";
    if (l.typology === "premium") {
      typologyLabel = "Lote Premium (Oasis)";
    } else if (l.typology === "tiny-house") {
      typologyLabel = "Lote Tiny House";
    } else if (l.typology === "zen") {
      typologyLabel = "Lote Zen";
    } else if (l.typology === "adjustment") {
      typologyLabel = "Lote Ajuste (Irregular)";
    }
    
    let statusLabel = "Disponible";
    if (l.status === "offer") {
      statusLabel = "En Oferta";
    } else if (l.status === "sold") {
      statusLabel = "Vendido";
    } else if (l.status === "reserved" || l.status === "blocked") {
      statusLabel = "Separado";
    }
    
    const areaFormatted = l.areaM2.toFixed(2).replace(".", ",");
    
    v2Lines.push([
      l.blockId,
      "Lote " + l.number,
      areaFormatted,
      typologyLabel,
      price.toString(),
      l.distanceToPool.toString(),
      l.hubDistance.toString(),
      statusLabel
    ].join(";"));
  });
  
  const v2Content = "\ufeff" + v2Lines.join("\r\n");
  const localV2Path = path.resolve(__dirname, "../cuadro_lotes_masterplan_v2.csv");
  const artifactV2Path = "C:/Users/LENOVO/.gemini/antigravity/brain/ab20ce93-86b9-457a-acc5-4c6d65ea60c2/cuadro_lotes_masterplan_v2.csv";
  
  try {
    fs.writeFileSync(localV2Path, v2Content, "utf8");
    console.log(`Saved ${v2Lines.length - 1} items to local CSV v2 at ${localV2Path}`);
  } catch (err) {
    console.error("Failed to write local CSV v2:", err);
  }
  
  try {
    if (fs.existsSync(path.dirname(artifactV2Path))) {
      fs.writeFileSync(artifactV2Path, v2Content, "utf8");
      console.log(`Saved ${v2Lines.length - 1} items to artifact CSV v2 at ${artifactV2Path}`);
    }
  } catch (err) {
    console.error("Failed to write artifact CSV v2:", err);
  }
}

run();
