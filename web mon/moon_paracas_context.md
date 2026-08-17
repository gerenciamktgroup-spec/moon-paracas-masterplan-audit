# Contexto del Proyecto Web: Moon Paracas

Este documento contiene el código fuente y los textos clave (copywriting) de la Landing Page del proyecto inmobiliario "Moon Paracas", un Eco-Condominio Rústico de Lujo en Paracas, Perú. 

Este archivo sirve para que una IA entienda de qué trata el proyecto, cuál es el tono de marca, qué amenidades tiene, cómo son las formas de pago y qué historia cuenta.

## Estructura de la Web
La web es una aplicación Single Page Application (SPA) en React (Vite + TailwindCSS) con una estructura de "Long-Scroll Storytelling" que guía al usuario por las siguientes secciones:

1. **Hero & Stats:** La portada con la propuesta de valor principal y contadores de escasez (lotes libres, reservados, etc.).
2. **Historia (ParacasHistory):** Conexión mística con la cultura Paracas y la naturaleza.
3. **Concepto (ConceptGallery):** Explicación del concepto arquitectónico.
4. **Casas (ArchitecturalRecommendations):** Guía de modelos de casas sugeridas.
5. **Estilo de Vida (LifestyleAmenities):** Áreas comunes y amenidades.
6. **Masterplan (App.tsx):** Mapa interactivo topográfico concéntrico.
7. **Simulador de Financiamiento (LotDetailsModal):** Calculadora de pagos sin intereses.
8. **Ingeniería (EngineeringSpecs):** Datos duros, sostenibilidad, muros rompevientos.
9. **Contratos (ContractsSignature):** Flujo de cierre y firma.

---

## Archivos de la Aplicación

### Archivo: `src/App.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { Lot } from "./types/map";
import { Header } from "./components/Header";
import MoonParacasMap from "./components/map/MoonParacasMap";
import { LotDetailsModal } from "./components/LotDetailsModal";
import { ConceptGallery } from "./components/ConceptGallery";
import { LifestyleAmenities } from "./components/LifestyleAmenities";
import { EngineeringSpecs } from "./components/EngineeringSpecs";
import { ContractsSignature } from "./components/ContractsSignature";
import { ParacasHistory } from "./components/ParacasHistory";
import { ArchitecturalRecommendations } from "./components/ArchitecturalRecommendations";
import { ShieldCheck, Trees, Phone, Mail, Map, Compass, HardHat, MessageSquare, Sparkles, Lock, BookOpen, Home } from "lucide-react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, writeBatch, updateDoc, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

// Model imports
import { buildTerrainScene, getMeterToSvgScale } from "./lib/terrainModel";
import { buildBlocks } from "./lib/blockModel";
import { buildLots, buildParkingLots } from "./lib/lotModel";
import { buildAmenities } from "./lib/amenityModel";
import { buildRoads } from "./lib/roadModel";
import { roadToPolygon } from "./lib/geometry";
import { checkCollision } from "./lib/spatialAnalyzer";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"masterplan" | "concept" | "lifestyle" | "engineering" | "signature" | "history" | "architecture">("masterplan");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // We no longer block loading since it's a public web
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize and sync lots with Firestore
  useEffect(() => {
    let isMounted = true;
    const lotsCol = collection(db, "lots");

    // ── PASO 1: Carga INMEDIATA desde el generador local ──────────────────
    const terrainScene = buildTerrainScene();
    const scale = getMeterToSvgScale();
    const blocks = buildBlocks(terrainScene.innerBuffer);
    const roads = buildRoads(terrainScene.innerBuffer);
    const amenities = buildAmenities(terrainScene.innerBuffer);
    
    // Convert roads to polygons for collision detection
    const roadPolys = roads.map(r => roadToPolygon(r.path, r.widthM, scale));
    
    const obstacles = [
      ...blocks.map((b: any) => b.polygon),
      ...amenities.map((a: any) => a.polygon),
      ...roadPolys
    ];
    
    // Build parking lots, avoiding blocks, amenities, and roads
    const parkings = buildParkingLots(terrainScene.innerBuffer, obstacles);
    const localLots = buildLots(blocks, parkings);
    
    // Filter out lots that overlap with buildings (exclude sand-plaza/Oasis)
    const activeBuildings = amenities
      .filter((a: any) => a.id !== "A_SAND" && a.kind !== "sand-plaza")
      .map((a: any) => a.polygon);
    const cleanLocalLots = localLots.filter(l => !checkCollision(l.polygon, activeBuildings, 0.1));
    
    const allLots = [...cleanLocalLots, ...parkings];
    
    setLots(allLots);
    setSelectedLot(allLots[0]);

    // Firebase sync bg
    getDocs(lotsCol).then(async (snap) => {
      try {
        const hasSeeded = localStorage.getItem("seeded-moon-v30");

        if (!hasSeeded || snap.empty || snap.docs.length < 100) {
          console.log("Re-seeding Firebase with Moon Paracas terrain lots...");
          const deleteBatch = writeBatch(db);
          snap.docs.forEach(d => deleteBatch.delete(d.ref));
          await deleteBatch.commit();

          const batch1 = writeBatch(db);
          const batch2 = writeBatch(db);
          allLots.forEach((lot, i) => {
            const ref = doc(db, "lots", lot.id);
            if (i < 250) batch1.set(ref, lot);
            else batch2.set(ref, lot);
          });
          await batch1.commit();
          await batch2.commit();
          localStorage.setItem("seeded-moon-v30", "true");
          console.log("✅ Firebase seeded with", allLots.length, "lots.");
        } else {
          const dbLots = snap.docs.map(d => d.data() as Lot);
          if (isMounted && dbLots.length > 0) {
            setLots(dbLots);
            setSelectedLot(prev => {
              const updated = dbLots.find(l => l.id === prev?.id);
              return updated ?? dbLots[0];
            });
          }
        }
      } catch (err) {}
    }).catch(() => {});

    // ── PASO 3: Escuchar cambios en tiempo real (reservas, estados) ───────
    const unsubscribe = onSnapshot(lotsCol, (snapshot) => {
      const dbLots = snapshot.docs.map(d => d.data() as Lot);
      if (isMounted && dbLots.length > 50) {
        // Sólo reemplazamos si Firebase tiene suficientes lotes
        setLots(dbLots);
        setSelectedLot(prev => {
          const updated = dbLots.find(l => l.id === prev?.id);
          return updated ?? dbLots[0];
        });
      }
    }, (error) => {
      console.warn("Firestore listener error:", error.message);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update lot status when user clicks "Reservar" (Firestore sync)
  const handleReserveLot = async (lotId: string) => {
    try {
      const lotRef = doc(db, "lots", lotId);
      await updateDoc(lotRef, {
        status: "offer"
      });
      setToastMessage(`¡Éxito! El lote ${lotId.split("-")[1]} ha sido pre-reservado con S/ 1,000 en garantía.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 5500);
    } catch (e) {
      console.error(e);
      setToastMessage("Error al reservar el lote. Intenta nuevamente.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Helper metrics for overall dashboard counters
  const residentialLots = lots.filter(l => l.blockId !== "PARKING");
  const parkingLots = lots.filter(l => l.blockId === "PARKING");
  
  const libresCount = residentialLots.filter(l => l.status === "available" || l.status === "offer").length;
  const reservadosCount = residentialLots.filter(l => l.status === "reserved").length;
  const vendidosCount = residentialLots.filter(l => l.status === "sold").length;
  const cocherasCount = parkingLots.length;

  return (
    <>
      <div className="min-h-[100dvh] bg-[#F4F4F1] font-sans selection:bg-[#C4A484] selection:text-[#2D3339] pb-16">
        
        {/* Premium Header */}
        <Header />

      {/* Main Container Wrapper */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-none bg-stone-900 px-5 py-4 text-sm text-white shadow-[4px_4px_0px_#C4A484] border-2 border-[#C4A484] flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#C4A484]" />
            <span className="font-bold tracking-wide">{toastMessage}</span>
          </div>
        )}

        {/* Modern Luxury Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden min-h-[350px] sm:min-h-[400px] flex items-end shadow-2xl group mb-8 border border-stone-200/50">
          {/* Background image - fully visible */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2600&auto=format&fit=crop")' }}
          />
          {/* Elegant gradient overlay - dark at bottom for text readability, fully transparent at top */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent z-0" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full p-6 sm:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8"
          >
            {/* Title Section */}
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#C4A484]/20 backdrop-blur-md border border-[#C4A484]/50 px-4 py-1.5 text-xs font-bold text-[#F4F4F1] uppercase tracking-widest shadow-lg">
                <Sparkles className="h-4 w-4" /> Etapa Fundadora
              </div>
              
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] uppercase drop-shadow-md">
                Moon Paracas. <br />
                <span className="text-[#C4A484] font-light">Refugio en el oasis.</span>
              </h2>
            </div>

            {/* Glassmorphism Info Card */}
            <div className="max-w-md bg-stone-900/30 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl">
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed mb-6 font-light">
                Un eco-condominio diseñado para la desconexión total sobre el tablazo de Paracas. <strong className="text-white font-medium">Arquitectura sostenible de adobe y terracota, cero contaminación vehicular, y seguridad absoluta.</strong>
              </p>
              
              <button 
                onClick={() => setActiveTab("masterplan")}
                className="group flex items-center justify-between w-full bg-white hover:bg-[#C4A484] text-stone-900 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-md"
              >
                <span>Descubrir Masterplan</span>
                <Map className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick numbers tracker bar (Marketing style) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-8 pb-4 text-center">
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#A3B18A]">
            <p className="text-xs font-bold text-[#A3B18A] uppercase tracking-widest mb-1.5">Lotes Libres</p>
            <p className="font-display font-black text-[#A3B18A] text-2xl sm:text-3xl">{libresCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#F57C00]">
            <p className="text-xs font-bold text-[#F57C00] uppercase tracking-widest mb-1.5">Lotes Reservados</p>
            <p className="font-display font-black text-[#F57C00] text-2xl sm:text-3xl">{reservadosCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#D32F2F]">
            <p className="text-xs font-bold text-[#D32F2F] uppercase tracking-widest mb-1.5">Lotes Vendidos</p>
            <p className="font-display font-black text-[#D32F2F] text-2xl sm:text-3xl">{vendidosCount}</p>
          </div>
          <div className="bg-white border-4 border-[#2D3339] p-4 shadow-[4px_4px_0px_#9E9E9E]">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Cocheras Totales</p>
            <p className="font-display font-black text-stone-500 text-2xl sm:text-3xl">{cocherasCount}</p>
          </div>
        </div>



        
        {/* =========================================
            LONG-SCROLL STORYTELLING CONTENT 
            ========================================= */}
        <div className="flex flex-col space-y-32 mt-16">
          
          {/* 1. HISTORY & CONCEPT */}
          <section id="history" className="scroll-mt-24 space-y-24">
            <ParacasHistory />
          </section>

          <section id="concept" className="scroll-mt-24">
            <ConceptGallery />
          </section>

          <section id="architecture" className="scroll-mt-24">
            <ArchitecturalRecommendations />
          </section>

          {/* 2. LIFESTYLE & AMENITIES */}
          <section id="lifestyle" className="scroll-mt-24">
            <LifestyleAmenities />
          </section>

          {/* 3. PRODUCT: MASTERPLAN */}
          <section id="masterplan" className="scroll-mt-24">
             <div className="text-center space-y-4 mb-8">
               <h2 className="font-display text-4xl sm:text-5xl font-black text-[#2D3339] uppercase tracking-wider">
                 Masterplan Interactivo
               </h2>
               <p className="text-stone-600 font-mono text-sm max-w-2xl mx-auto">
                 Explora el diseño concéntrico de Moon Paracas. Haz zoom, selecciona parcelas y verifica disponibilidad en tiempo real.
               </p>
             </div>
             <div className="w-full">
                <MoonParacasMap
                  lots={lots}
                  selectedLot={selectedLot}
                  onSelectLot={setSelectedLot}
                />
             </div>
          </section>

          {/* 4. FINANCIAL SIMULATOR */}
          <section id="financiamiento" className="scroll-mt-24 w-full max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-6">
               <h2 className="font-display text-3xl font-black text-[#2D3339] uppercase tracking-wider">
                 Cotizador en Tiempo Real
               </h2>
               <p className="text-stone-500 font-mono text-sm max-w-lg mx-auto">
                 Verifica las cuotas y planes de financiamiento directo a 18 meses con 0% de interés del lote seleccionado.
               </p>
            </div>
            <LotDetailsModal
              lot={selectedLot}
              onReserve={handleReserveLot}
            />
          </section>

          {/* 5. ENGINEERING SPECS */}
          <section id="engineering" className="scroll-mt-24">
            <EngineeringSpecs />
          </section>

          {/* 6. CONTRACTS & SIGNATURE */}
          <section id="signature" className="scroll-mt-24">
            <ContractsSignature 
              selectedLot={selectedLot}
              onSignatureSuccess={(msg) => {
                setToastMessage(msg);
                setTimeout(() => setToastMessage(null), 5500);
              }}
            />
          </section>

        </div>


        {/* CONTACT US FORM (Inspired directly by the reference website layout) */}
        <div id="contact-form" className="rounded-none border-4 border-[#2D3339] bg-white p-6 sm:p-8 shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-sans text-sm font-black tracking-widest text-[#8C905C] uppercase">
              COTIZA TU LOTE DE CAMPO RÚSTICO DE LUJO
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-black text-[#2D3339] tracking-tight uppercase">
              CONTÁCTANOS
            </h3>
            <p className="text-sm text-stone-600">
              Déjanos tus datos y un asesor especializado de Moon Paracas se pondrá en contacto contigo lo más pronto posible para agendar una visita al desierto.
            </p>
          </div>

          {formSubmitted ? (
            <div className="border-4 border-dashed border-[#8C905C] bg-[#8C905C]/5 p-8 text-center space-y-4 max-w-xl mx-auto animate-fade-in font-mono">
              <span className="text-4xl text-[#8C905C]">🏜️</span>
              <h4 className="font-bold text-lg text-[#2D3339] uppercase tracking-wide">¡Solicitud Registrada con Éxito!</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Gracias, <strong>{contactName}</strong>. Hemos pre-registrado tu interés en el <strong>Lote {selectedLot?.id || "en consulta"}</strong>. Un arquitecto-promotor te enviará los planos catastrales oficiales y el reglamento por correo a <em>{contactEmail}</em> o vía WhatsApp al <em>{contactPhone}</em>.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setContactName("");
                  setContactEmail("");
                  setContactPhone("");
                  setContactMessage("");
                }}
                className="mt-2 rounded-none bg-[#2D3339] text-white border-2 border-[#2D3339] px-5 py-2 text-xs font-bold font-mono tracking-wider hover:bg-stone-800"
              >
                REGISTRAR OTRA CONSULTA
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactName || !contactPhone || !contactEmail) {
                  setToastMessage("Por favor rellena todos los campos obligatorios (*).");
                  setTimeout(() => setToastMessage(null), 3000);
                  return;
                }
                setFormSubmitted(true);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto font-mono text-xs"
            >
              {/* Left Column Fields */}
              <div className="space-y-3 text-[#2D3339]">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider flex justify-between">
                    <span>Nombre Completo *</span>
                    <span className="text-[9px] text-[#8C905C] italic">Requerido</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. Carlos Mendoza Quiroz"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider flex justify-between">
                    <span>WhatsApp / Celular *</span>
                    <span className="text-[9px] text-[#8C905C]">Prefijo Perú: +51</span>
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. +51 987 654 321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] transition-colors"
                    placeholder="Ej. carlos.mendoza@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column Fields */}
              <div className="space-y-3 flex flex-col justify-between text-[#2D3339]">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Lote de Interés (Auto-seleccionado)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 bg-[#F4F4F1] font-bold text-[#8C905C]"
                    value={
                      selectedLot 
                        ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area.toFixed(2)} m² - S/ ${selectedLot.price.toLocaleString('es-PE', {maximumFractionDigits: 0})})`
                        : "Ningún lote seleccionado en el plano"
                    }
                  />
                </div>

                <div className="space-y-1 flex-1 flex flex-col">
                  <label className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">Mensaje de Consulta</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-none border-2 border-[#2D3339] px-3.5 py-2 hover:bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8C905C] flex-1 min-h-[90px] transition-colors text-[#2D3339]"
                    placeholder="Deseo coordinar una videollamada para revisar el cronograma de financiamiento de mi lote y verificar de áreas comunes..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
              </div>

              {/* Form submit & secondary direct whatsapp trigger */}
              <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#8C905C] border-2 border-[#2D3339] text-white font-bold text-xs py-3.5 px-6 uppercase tracking-widest hover:bg-[#7a7e4e] transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339]"
                >
                  ENVIAR SOLICITUD A LA ASOCIACIÓN
                </button>
                
                {selectedLot && (
                  <a
                    href={`https://wa.me/51987654321?text=Hola!%20Deseo%20cotizar%20el%20lote%20${selectedLot.id}%20con%20m2%20de%20${selectedLot.area}%20de%20área.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#00E676] hover:bg-[#00C853] text-[#2D3339] font-bold text-xs py-3.5 px-6 border-2 border-[#2D3339] flex items-center justify-center gap-2 transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339]"
                  >
                    <MessageSquare className="h-4.5 w-4.5 fill-current" />
                    CHATEAR POR WHATSAPP AHORA
                  </a>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Technical Map references guide card */}
        <div className="rounded-none border-4 border-[#2D3339] bg-[#2D3339] p-6 text-stone-100 shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#C4A484]/10 to-transparent pointer-events-none rounded-none" />
          <div className="space-y-2">
            <h3 className="font-mono text-sm font-bold text-[#C4A484] uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#C4A484]" />
              Sustentación de Altura y Nivel Topográfico (PT-01)
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-mono max-w-4xl">
              El Lote Matriz del condominio reporta una gradiente altimétrica que oscila desde los <strong>106.5m s.n.m.</strong> en la zona sur (pórtico de ingreso Atardecer) hasta los <strong>113.5m s.n.m.</strong> en el extremo norte (Sectores altos de El Mirador). El diseño vial concéntrico del Oasis respeta a cabalidad las líneas naturales de contorno, evitando movimientos de tierra agresivos que alteren el ecosistema de dunas y asegurando que el 94% de los lotes retengan vistas despejadas horizontales.
            </p>
          </div>
        </div>

      </main>

      {/* Luxury Footer with contacts info mimicking real agency landing page */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 border-t-2 border-[#2D3339]/20 mt-16 pt-8 text-stone-500 text-xs font-mono">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trees className="h-5 w-5 text-[#6B8E23]" />
            <div>
              <p className="font-mono font-bold text-[#2D3339] uppercase">MOON PARACAS</p>
              <p className="text-[10px] text-stone-500">© 2026 Asociación Civil de Adjudicatarios Moon Paracas · Ica, Perú.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-500 text-[11px]">
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Phone className="h-3.5 w-3.5 text-[#C4A484]" /> +51 987 654 321
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Mail className="h-3.5 w-3.5 text-[#C4A484]" /> info@moonparacas-eco.pe
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#2D3339] cursor-pointer">
              <Map className="h-3.5 w-3.5 text-[#6B8E23]" /> Paracas, Km 245 Panamericana Sur
            </span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

```

### Archivo: `src/components/Header.tsx`
```tsx
import React from "react";
import { TreePine, CalendarDays, Receipt, LogOut, User } from "lucide-react";

export const MoonLogo: React.FC<{ className?: string; size?: number; dark?: boolean }> = ({
  className = "",
  size = 48,
  dark = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      {/* Circle border */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={dark ? "#F4F4F1" : "#C4A484"}
        strokeWidth="3"
      />
      {/* Sand dune path 1 */}
      <path
        d="M 12,65 Q 32,44 54,62 T 88,58"
        stroke={dark ? "#C4A484" : "#2D3339"}
        strokeWidth="2.5"
        strokeLinecap="square"
        fill="none"
      />
      {/* Sand dune path 2 (secondary detail) */}
      <path
        d="M 18,74 Q 45,58 68,70 T 84,68"
        stroke={dark ? "#F4F4F1" : "#C4A484"}
        strokeWidth="2"
        strokeLinecap="square"
        fill="none"
      />
      {/* Sun/Moon tiny crescent glow */}
      <path
        d="M 68,26 A 14,14 0 0 0 54,42"
        stroke={dark ? "#C4A484" : "#F4F4F1"}
        strokeWidth="2"
      />
    </svg>
  );
};

export const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  return (
    <header className="border-b-4 border-[#2D3339] bg-[#2D3339] text-white sticky top-0 z-40 px-6 py-4">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 lg:flex-row">
        {/* Brand Sign */}
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] bg-[#C4A484] flex items-center justify-center font-display font-black text-2xl text-[#2D3339]">
            M
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-2xl font-black tracking-widest text-white uppercase leading-none mb-1.5">
              MOON <span className="font-light text-[#C4A484]">PARACAS</span>
            </h1>
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#C4A484] opacity-90 leading-none">
              Eco-Condominio Rústico de Lujo
            </p>
          </div>
        </div>

        {/* Horizontal Nav Pills - Scrollable on mobile */}
        <div className="flex overflow-x-auto hide-scrollbar w-full lg:w-auto items-center gap-2 pb-2 lg:pb-0 pt-2 lg:pt-0 border-t border-stone-700 lg:border-none mt-2 lg:mt-0">
          {[
            { id: "masterplan", icon: <TreePine className="w-4 h-4" />, label: "Masterplan" },
            { id: "history", icon: <CalendarDays className="w-4 h-4" />, label: "Historia" },
            { id: "architecture", icon: <User className="w-4 h-4" />, label: "Casas" },
            { id: "lifestyle", icon: <TreePine className="w-4 h-4" />, label: "Estilo Vida" },
            { id: "engineering", icon: <Receipt className="w-4 h-4" />, label: "Ingeniería" },
            { id: "concept", icon: <CalendarDays className="w-4 h-4" />, label: "Concepto" },
            { id: "signature", icon: <LogOut className="w-4 h-4" />, label: "Contratos" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 bg-transparent border-stone-600 text-stone-400 hover:border-[#C4A484] hover:text-white"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

```

### Archivo: `src/components/ParacasHistory.tsx`
```tsx
import React from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Home, Compass } from 'lucide-react';

export const ParacasHistory = () => {
  const historySections = [
    {
      title: "El Viento y El Desierto",
      description: "Inspirado en la fuerza del legendario viento 'El Paracas', nuestra arquitectura de adobe y pircas de piedra natural se mimetiza orgánicamente con las majestuosas dunas del desierto, creando un refugio de paz absoluta.",
      icon: <Wind className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-10.png",
      reverse: false
    },
    {
      title: "Textiles Antiguos y Diseño Interior",
      description: "El misticismo de la cultura milenaria de Paracas vive en los interiores de nuestras villas. Tonos terracota, ocres y vigas de eucalipto crean una atmósfera rústica de lujo que conecta el pasado con el presente.",
      icon: <Compass className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-5.png",
      reverse: true
    },
    {
      title: "Estilo de Vida Off-Road Sostenible",
      description: "Explora la inmensidad árida en buggies y estaciona bajo pérgolas de eucalipto cubiertas por paneles solares. Un equilibrio perfecto entre la aventura en el desierto y el respeto absoluto por el medio ambiente.",
      icon: <Sun className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-2.png",
      reverse: false
    },
    {
      title: "Noches Místicas de Fuego y Piedra",
      description: "Bajo cielos despejados e inundados de estrellas, las áreas de fogata rodeadas de muros de piedra y paisajismo xerófilo se convierten en el centro de reunión para disfrutar de la serenidad nocturna del desierto.",
      icon: <Home className="w-8 h-8 text-amber-600" />,
      image: "/images/history/history-4.png",
      reverse: true
    }
  ];

  return (
    <div className="bg-[#fcfaf7] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl font-serif text-slate-800 mb-6">El Origen y la Magia de Paracas</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Un diseño rústico de lujo nacido de la tierra, pensado para resistir el tiempo y conectarte con el paisaje más imponente de la costa peruana.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[1, 6, 8, 9].map((imgNum, idx) => (
             <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
              >
                <img src={`/images/history/history-${imgNum}.png`} alt="Concepto Paracas" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
             </motion.div>
          ))}
        </div>

        <div className="space-y-24">
          {historySections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row gap-12 items-center ${section.reverse ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-2">
                  {section.icon}
                </div>
                <h3 className="text-3xl font-serif text-slate-800">{section.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">{section.description}</p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={section.image} alt={section.title} className="w-full h-auto object-cover" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

```

### Archivo: `src/components/ConceptGallery.tsx`
```tsx
import React, { useState } from "react";
import { Trees, Sun, Moon, Sparkles, Navigation, Layers, CheckCircle2 } from "lucide-react";

interface Concept {
  id: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
  vibe: string;
  gradient: string;
  icon: React.ReactNode;
  imageUrl: string;
  hotspots: { name: string; x: string; y: string; desc: string }[];
}

export const ConceptGallery: React.FC = () => {
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const concepts: Concept[] = [
    {
      id: "portico",
      title: "Pórtico y Alamedas Rústicas",
      tagline: "Ingreso Monumental en Piedra de Cantera y Eucalipto",
      description: "La primera impresión de exclusividad. Diseñado con muros macizos de piedra de cantera natural, vigas gruesas de eucalipto seco, cactus candelabro y majestuosos agaves ornamentales.",
      details: [
        "Control de accesos automatizado y seguridad 24/7.",
        "Caseta integrada camuflada con piedra del desierto.",
        "Alamedas peatonales y de buggies con sombreadores rústicos.",
        "Arquitectura bioclimática que repele ráfagas de viento y arena."
      ],
      vibe: "Xeripaisajismo y piedra natural",
      gradient: "from-amber-100 to-orange-100",
      icon: <Layers className="h-5 w-5 text-amber-800" />,
      imageUrl: "/gemini_generated_image_g13l4tg13l4tg13l.jpg",
      hotspots: [
        { name: "Vigas de Eucalipto", x: "25%", y: "40%", desc: "Troncos rústicos tratados para alta durabilidad frente al clima desértico." },
        { name: "Muros de Cantera", x: "75%", y: "65%", desc: "Piedra de la región apilada de forma artesanal respetando tonos áridos." },
        { name: "Xeripaisajismo", x: "45%", y: "80%", desc: "Matorrales xerófitos autóctonos como cactus y agaves que requieren mínimo riego." }
      ]
    },
    {
      id: "villas-dia",
      title: "Villas Rústicas de Lujo",
      tagline: "Arquitectura Integrada al Paisaje de Dunas",
      description: "Casas unifamiliares integradas en parcelas amplias. Fachadas en tonos terracota, cercos de pircas de piedra y techos transitables con pérgolas rústicas optimizados para paneles solares.",
      details: [
        "Preparación para energía solar privada e iluminación ecológica.",
        "Fachadas de color terracota/arena que se mimetizan con el entorno.",
        "Jardines secos privados y sistemas de reciclaje de agua.",
        "Estacionamientos rústicos con cargador para buggies eléctricos."
      ],
      vibe: "Elegancia natural en el desierto",
      gradient: "from-amber-50 to-emerald-50",
      icon: <Sun className="h-5 w-5 text-emerald-700" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4_1.jpg",
      hotspots: [
        { name: "Techo Solar", x: "50%", y: "25%", desc: "Puntos de anclaje listos para sistemas fotovoltaicos de autoconsumo." },
        { name: "Cerco de Pirca", x: "80%", y: "70%", desc: "Muros bajos divisorios con piedra caliza dorada apilada a mano." },
        { name: "Materiales Nobles", x: "30%", y: "82%", desc: "Revestimientos rústicos de madera tratada y barro texturizado." }
      ]
    },
    {
      id: "oasis",
      title: "Club Oasis y Piscina de Piedra",
      tagline: "El Corazón Recreativo y Social del Proyecto",
      description: "Un oasis central con piscina construida con revestimiento de piedra de río y decks de madera natural, rodeado de vegetación nativa y un gran fogón para noches templadas.",
      details: [
        "Piscina oasis de 395m² y espejo de agua de 252m².",
        "Pérgolas rústicas de eucalipto con zonas de descanso.",
        "Fogón central (Fire Pit) integrado en piedra para reuniones sociales.",
        "Sendero Zen y áreas para yoga y meditación al aire libre."
      ],
      vibe: "Relajación absoluta bajo las estrellas",
      gradient: "from-blue-50 to-indigo-50",
      icon: <Moon className="h-5 w-5 text-indigo-700" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4.jpg",
      hotspots: [
        { name: "Piscina de Piedra", x: "40%", y: "55%", desc: "Acabados de piedra natural que brindan frescura y mimetismo con el oasis." },
        { name: "Fogón Central", x: "70%", y: "75%", desc: "Anillo rústico para fogatas comunitarias bajo el cielo limpio de Ica." },
        { name: "Decks de Madera", x: "20%", y: "45%", desc: "Terrazas de madera natural tratada para tomar sol y descansar." }
      ]
    },
    {
      id: "sol-solar",
      title: "Xeripaisajismo y Huertos Orgánicos",
      tagline: "Respeto Absoluto a la Flora Nativa",
      description: "Diseño paisajístico enfocado en plantas de muy bajo consumo hídrico, combinado con un huerto orgánico común y caminos de tierra compactada para caminatas de desconexión.",
      details: [
        "Áreas comunes forestadas con Huarangos, Palmeras e Icacos.",
        "Huerto orgánico vecinal para cultivo de hierbas aromáticas y frutales.",
        "Sendero ecológico perimetral de arcilla compactada para caminatas.",
        "Reglamento estricto de paisajismo para conservar la armonía visual."
      ],
      vibe: "Sostenibilidad y vida orgánica",
      gradient: "from-amber-100 to-emerald-100",
      icon: <Trees className="h-5 w-5 text-amber-800" />,
      imageUrl: "/gemini_generated_image_6ba4496ba4496ba4_2.jpg",
      hotspots: [
        { name: "Huerto Común", x: "65%", y: "30%", desc: "Zona compartida para prácticas de agricultura urbana orgánica en el desierto." },
        { name: "Senderos Nativos", x: "35%", y: "72%", desc: "Caminos peatonales sombreados por huarangos y sauces de la zona." }
      ]
    }
  ];

  const current = concepts[activeConceptIdx];

  return (
    <div id="design-concept" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="border-b border-stone-200 pb-5">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#C4A484]" />
          Concepto Arquitectónico
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-3xl">
          Contraste desértico entre las dunas doradas, cantera de piedra rústica, xerofitismo de agaves y eco-tecnologías.
        </p>
      </div>

      {/* Tabs list of concepts */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((con, idx) => (
          <button
            key={con.id}
            onClick={() => {
              setActiveConceptIdx(idx);
              setActiveHotspot(null);
            }}
            className={`flex items-center gap-2 rounded-none px-4 py-2.5 text-sm font-bold border-2 transition-all ${
              activeConceptIdx === idx
                ? "bg-[#2D3339] border-[#2D3339] text-white"
                : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
            }`}
          >
            {con.icon}
            {con.title.split(" ")[0]} {con.title.split(" ")[1] || ""}
          </button>
        ))}
      </div>

      {/* Main interactive visualization block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Illustrative Map Hotspot Viewer */}
        <div className={`lg:col-span-6 rounded-none bg-gradient-to-br ${current.gradient} border-2 border-[#2D3339] p-6 flex flex-col justify-between relative overflow-hidden min-h-[360px] shadow-[4px_4px_0px_#2D3339]`}>
          
          {/* Subtle desert horizon curve background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#fff8dc_10%,transparent_70%)] opacity-30 pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            <span className="rounded-none bg-[#2D3339] px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
              Vista Esquematizada
            </span>
            <span className="text-xs text-stone-600 italic font-bold">{current.vibe}</span>
          </div>

          {/* Interactive hotspot map render simulation */}
          <div className="relative w-full h-[280px] my-5 border-2 border-[#2D3339] rounded-none bg-stone-200 shadow-md">
            
            <img 
              src={current.imageUrl} 
              alt={current.title}
              className="w-full h-full object-cover filter brightness-90 contrast-125"
              referrerPolicy="no-referrer"
            />
            
            {/* Dark overlay for better hotspot visibility */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Hotspots layer clickable */}
            {current.hotspots.map((hs, hidx) => {
              const isOpen = activeHotspot === hs.name;
              return (
                <div
                  key={`hs-${hidx}`}
                  className="absolute"
                  style={{ left: hs.x, top: hs.y }}
                >
                  <button
                    onClick={() => setActiveHotspot(isOpen ? null : hs.name)}
                    className={`h-8 w-8 rounded-none flex items-center justify-center font-bold text-sm border-2 border-[#2D3339] transition-all duration-300 ${
                      isOpen
                        ? "bg-[#C4A484] text-white scale-110"
                        : "bg-[#2D3339] text-[#F4F4F1] hover:scale-110 animate-bounce"
                    }`}
                    title={hs.name}
                  >
                    <Navigation className="h-4 w-4 transform rotate-45" />
                  </button>

                  {/* Hotspot tooltip content */}
                  {isOpen && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#2D3339] text-white text-xs p-3.5 rounded-none shadow-lg border border-white/20 w-[220px] z-30 leading-snug">
                      <p className="font-bold text-[#C4A484] uppercase tracking-wide">{hs.name}</p>
                      <p className="mt-1 opacity-90">{hs.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-stone-700 text-center">
            📌 Haz clic en los orientadores <Navigation className="inline h-3 w-3 rotate-45 text-[#C4A484]" /> para ver materiales y especificaciones de obra.
          </p>
        </div>

        {/* Right Side: Specifications and criteria */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#C4A484] uppercase tracking-widest">
              {current.tagline}
            </span>
            <h3 className="font-display text-3xl font-bold uppercase text-[#2D3339] leading-none">
              {current.title}
            </h3>
            <p className="text-base text-stone-600 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Detailed requirements ticks */}
          <div className="space-y-4 bg-stone-50 rounded-none p-6 border-2 border-[#2D3339] shadow-[2px_2px_0px_#2D3339]">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest border-b border-[#2D3339]/10 pb-2">
              Requisitos Bioclimáticos de Obra
            </h4>
            
            <div className="grid grid-cols-1 gap-3.5 text-sm text-[#2D3339] font-medium">
              {current.details.map((spec, sIdx) => (
                <div key={`spec-${sIdx}`} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#6B8E23] mt-0 flex-shrink-0" />
                  <span className="leading-snug">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note about construction norms */}
          <div className="p-4 border-l-4 border-[#C4A484] bg-stone-50 text-xs text-stone-600 leading-snug">
            * Todas las viviendas deben adherirse al <strong>Reglamento de Construcción del Propietario (Anexo B)</strong>, el cual promueve fachadas con revestimientos terrosos y cubiertas transitables con sombreadores de eucalipto.
          </div>
        </div>

      </div>
    </div>
  );
};

```

### Archivo: `src/components/ArchitecturalRecommendations.tsx`
```tsx
import React from 'react';
import { motion } from 'motion/react';
import { Tent, Container, CheckCircle2 } from 'lucide-react';

export const ArchitecturalRecommendations = () => {
  return (
    <div className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-serif text-slate-800 mb-6">Recomendaciones Arquitectónicas</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Descubre nuestras propuestas de construcción eco-amigables y modulares. Modelos ideales para mimetizarse con el entorno rústico del desierto, ofreciendo lujo, rapidez de instalación y eficiencia térmica.
          </p>
        </motion.div>

        <div className="space-y-24">
          
          {/* Domo Ecológico */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                    <span className="text-slate-400 font-medium">[Domo Imagen {i}]</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium text-sm">
                <Tent className="w-5 h-5" /> Opción 1: Domo Geodésico Rústico
              </div>
              <h3 className="text-3xl font-serif text-slate-800">Inmersión Absoluta en el Desierto</h3>
              <p className="text-lg text-slate-600">
                Los domos ofrecen una resistencia superior frente a "El Paracas" gracias a su aerodinámica. Su estructura permite un control térmico natural excelente, manteniéndose frescos en verano y cálidos en las frías noches del desierto.
              </p>
              <ul className="space-y-4 pt-4">
                {["Construcción rápida y limpia (menos de 60 días).", "Aislamiento térmico y acústico superior.", "Diseño panorámico para ver las estrellas.", "Materiales rústicos en el interior (madera, barro)."].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full"></div>

          {/* Casa Contenedor */}
          <div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-md">
                    <span className="text-slate-400 font-medium">[Contenedor Imagen {i}]</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium text-sm">
                <Container className="w-5 h-5" /> Opción 2: Casa Contenedor Rústica
              </div>
              <h3 className="text-3xl font-serif text-slate-800">Sostenibilidad Modular y Diseño Moderno</h3>
              <p className="text-lg text-slate-600">
                Reutilización inteligente de contenedores marítimos revestidos externamente con madera, esterilla y texturas de adobe para cumplir con el reglamento rústico. Una solución altamente resistente, ampliable y de lujo.
              </p>
              <ul className="space-y-4 pt-4">
                {["Estructura modular expandible a futuro.", "Revestimientos ecológicos que camuflan el metal.", "Alta resistencia a la corrosión y el clima extremo.", "Integración perfecta de techos planos con paneles solares."].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

```

### Archivo: `src/components/LifestyleAmenities.tsx`
```tsx
import React from "react";
import { Trees, Sun, Compass, ShieldCheck, Activity, Eye, Zap, Flame } from "lucide-react";

export const LifestyleAmenities: React.FC = () => {
  const features = [
    {
      title: "Energía Solar y Autoconsumo",
      desc: "Todas las parcelas están preparadas para la instalación de sistemas de paneles solares fotovoltaicos, logrando una autosuficiencia energética limpia en armonía con el microclima soleado de Paracas.",
      icon: <Sun className="h-6 w-6 text-amber-600" />,
      tag: "Solar-Ready"
    },
    {
      title: "Cero Emisiones Internas (Living Streets)",
      desc: "Nuestras vías internas de 6.0m de ancho están diseñadas para la circulación peatonal, bicicletas y buggies eléctricos silenciosos, eliminando la contaminación acústica y los gases de combustión.",
      icon: <Zap className="h-6 w-6 text-emerald-600" />,
      tag: "Eco-Movilidad"
    },
    {
      title: "Reciclaje Hídrico Integral (PTAR)",
      desc: "El condominio cuenta con una Planta de Tratamiento de Aguas Residuales (PTAR) biológica. El agua tratada se utiliza exclusivamente para el riego de áreas verdes y el xeripaisajismo.",
      icon: <Trees className="h-6 w-6 text-teal-600" />,
      tag: "Sostenibilidad"
    },
    {
      title: "Pórtico y Seguridad Controlada 24/7",
      desc: "Moon Paracas cuenta con un cerco perimetral de seguridad y un pórtico de control de accesos automatizado. Personal de vigilancia y monitoreo constante para tu total tranquilidad.",
      icon: <ShieldCheck className="h-6 w-6 text-stone-700" />,
      tag: "Privacidad"
    },
    {
      title: "Observación Astronómica Nocturna",
      desc: "Aprovecha la pureza del cielo del tablazo de Paracas, libre de contaminación lumínica. Disfruta de noches estrelladas únicas y observación de constelaciones desde nuestro Mirador Zen.",
      icon: <Eye className="h-6 w-6 text-indigo-600" />,
      tag: "Vistas del Cielo"
    },
    {
      title: "Aventura y Deportes de Desierto",
      desc: "Ubicación estratégica a minutos de la Bahía y la Reserva Nacional de Paracas. Perfecto para la práctica de Sandboard en las dunas, Kitesurf, Windsurf, paseos en tubular y trekking costero.",
      icon: <Activity className="h-6 w-6 text-[#E15A42]" />,
      tag: "Aventura"
    }
  ];

  return (
    <div id="lifestyle-amenities" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="border-b border-stone-200 pb-5 text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center justify-center lg:justify-start gap-3">
          <Trees className="h-7 w-7 text-[#A3B18A]" />
          Eco-Vida y Amenidades Premium
        </h2>
        <p className="text-base text-stone-600 mt-2 max-w-3xl">
          Moon Paracas es una propuesta de desconexión y contacto con el desierto, construida bajo estándares de sostenibilidad, cero ruido vehicular y alta privacidad.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="border-2 border-[#2D3339] p-5 bg-stone-50 flex flex-col justify-between hover:translate-y-[-2px] transition-all shadow-[3px_3px_0px_#2D3339]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-200/60 px-2 py-0.5">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#2D3339] uppercase">
                {f.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlight Section: The Oasis Experience */}
      <div className="border-4 border-[#2D3339] bg-stone-900 text-stone-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-none bg-[#A3B18A] px-3 py-1 text-xs font-bold text-[#2D3339]">
            <Flame className="h-3.5 w-3.5" /> Exclusividad Central
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight">
            La Experiencia Oasis y Club Moon
          </h3>
          <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
            Nuestros residentes disfrutan de un Oasis central con una **Piscina Oasis de 395 m²** y un **Espejo de Agua de 252 m²**, rodeados de áreas verdes nativas, terrazas de madera (Decks), zonas de Yoga y un Fogón Místico para disfrutar de atardeceres y noches mágicas bajo el cielo desértico de Ica.
          </p>
        </div>
        <div className="lg:col-span-4 bg-stone-800 border-2 border-stone-700 p-4 text-center space-y-2">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Áreas Recreativas Comunes</p>
          <div className="grid grid-cols-2 gap-2 text-stone-100">
            <div className="bg-stone-900/60 p-2.5 border border-stone-700">
              <p className="text-lg font-bold font-mono text-[#A3B18A]">395m²</p>
              <p className="text-[9px] text-stone-400 uppercase">Piscina Oasis</p>
            </div>
            <div className="bg-stone-900/60 p-2.5 border border-stone-700">
              <p className="text-lg font-bold font-mono text-[#A3B18A]">252m²</p>
              <p className="text-[9px] text-stone-400 uppercase">Espejo de Agua</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

```

### Archivo: `src/components/EngineeringSpecs.tsx`
```tsx
import React, { useState } from "react";
import { ShieldAlert, Wind, Mountain, ChevronDown, CheckCircle } from "lucide-react";

export const EngineeringSpecs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const specs = [
    {
      title: "Resiliencia Sísmica (Zona 4) y Plateas de Cimentación",
      icon: <Mountain className="h-5 w-5 text-[#E15A42]" />,
      content: "Ubicados en la Zona Sísmica 4, el reglamento exige el máximo nivel de seguridad estructural. Hemos adoptado el uso obligatorio de plateas de cimentación rígidas para cada vivienda, distribuyendo el peso uniformemente sobre la arena compactada del tablazo y evitando asentamientos diferenciales en caso de sismos severos."
    },
    {
      title: "Cemento Tipo V: Protección contra Sulfatos",
      icon: <ShieldAlert className="h-5 w-5 text-[#E15A42]" />,
      content: "El desierto salitroso y las brisas de la costa presentan altos niveles de sulfatos que degradan el concreto normal. El Masterplan exige el uso de Cemento Tipo V en todas las cimentaciones, garantizando una alta resistencia a la corrosión y prolongando la vida útil estructural de tu inversión a más de 50 años."
    },
    {
      title: "Trazado Vial Anti-Viento Paracas",
      icon: <Wind className="h-5 w-5 text-[#E15A42]" />,
      content: "En lugar de la clásica cuadrícula que crea túneles de viento, nuestras calles tienen un diseño sinuoso y orgánico. Esto rompe la velocidad de los vientos predominantes (Sur a Norte), protegiendo la habitabilidad exterior, reduciendo el polvo y mejorando el confort térmico dentro de los clusters."
    },
    {
      title: "Geografía de Tablazo (Cero Riesgo de Inundación)",
      icon: <CheckCircle className="h-5 w-5 text-[#E15A42]" />,
      content: "Al asentar el proyecto sobre el tablazo a más de 106 metros sobre el nivel del mar, Moon Paracas garantiza una absoluta seguridad física y estructural frente a inundaciones, maremotos o subidas de marea, consolidando un terreno sumamente estable en la meseta desértica."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white border-4 border-[#2D3339] p-8 shadow-lg">
      <div className="text-center space-y-3 mb-8">
        <h2 className="font-display text-3xl font-black text-[#2D3339] uppercase tracking-tight">
          Seguridad e <span className="text-[#A3B18A]">Ingeniería</span>
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Conoce los parámetros constructivos obligatorios que protegen tu inversión frente a las condiciones reales de Paracas.
        </p>
      </div>

      <div className="space-y-4">
        {specs.map((spec, index) => (
          <div key={index} className="border-2 border-stone-200 hover:border-[#A3B18A] transition-colors">
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full flex items-center justify-between p-4 bg-stone-50 text-left"
            >
              <div className="flex items-center gap-3">
                {spec.icon}
                <span className="font-bold text-[#2D3339]">{spec.title}</span>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-stone-500 transition-transform ${openIndex === index ? "rotate-180" : ""}`} 
              />
            </button>
            {openIndex === index && (
              <div className="p-4 bg-white border-t-2 border-stone-100 text-stone-600 text-sm leading-relaxed">
                {spec.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

```

### Archivo: `src/components/LotDetailsModal.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { Lot } from "../types/map";
import { Compass, Calendar, ShieldCheck, SunDim, Landmark, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface LotDetailsProps {
  lot: Lot | null;
  onReserve: (lotId: string) => void;
}

export const LotDetailsModal: React.FC<LotDetailsProps> = ({ lot, onReserve }) => {
  // Financial calculation parameters
  const [downpaymentPercentage, setDownpaymentPercentage] = useState<number>(30);
  const [financingMonths, setFinancingMonths] = useState<number>(12);
  const [separationFee] = useState<number>(1000); // S/ 1,000 fixed separation fee

  // Reset calculations on lot change
  useEffect(() => {
    setDownpaymentPercentage(30);
    setFinancingMonths(12);
  }, [lot]);

  if (!lot) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center justify-center p-8 text-center h-full border-2 border-dashed border-stone-300 rounded-none bg-stone-50 shadow-sm min-h-[580px]"
      >
        <Compass className="h-10 w-10 text-[#C4A484] mb-3 animate-spin" style={{ animationDuration: "14s" }} />
        <h3 className="font-display font-bold text-[#2D3339] uppercase tracking-wider text-xl mt-3">Selecciona un lote</h3>
        <p className="text-sm text-stone-600 mt-2 max-w-[280px] leading-relaxed">
          Haz clic en cualquier parcela del máster plan interactivo para inspeccionar sus características técnicas, elevación y calcular sus cuotas de financiamiento.
        </p>
      </motion.div>
    );
  }

  // Financial calculations
  const totalPrice = lot.price;
  const rawDownpayment = (totalPrice * downpaymentPercentage) / 100;
  const downpaymentToPay = Math.max(0, rawDownpayment - separationFee);
  const remainingFinanced = totalPrice - rawDownpayment;
  
  // Base payment plus 5% monthly administrative fee (pasarela de pagos)
  const baseMonthly = remainingFinanced / financingMonths;
  const adminFeeMonthly = baseMonthly * 0.05; 
  const monthlyPayment = baseMonthly + adminFeeMonthly;

  // Simulate solar parameter
  const numVal = typeof lot.number === 'number' ? lot.number : (parseInt(lot.number.replace(/\D/g, ""), 10) || 0);
  const peakSolarHours = (5.8 + (numVal % 3) * 0.4).toFixed(1);

  // Generate Recharts Data
  const chartData = Array.from({ length: financingMonths }).map((_, i) => ({
    name: `M${i + 1}`,
    base: baseMonthly,
    fee: adminFeeMonthly,
  }));

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={lot.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6 rounded-none border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 min-h-[580px]"
      >
        {/* Target Lot Title & Sector Info */}
        <div className="flex items-start justify-between border-b pb-4 border-[#2D3339]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-none px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                lot.status === "available" ? "bg-[#A3B18A] text-[#2D3339] border-[#7C8D65]" :
                lot.status === "offer" ? "bg-[#E0B084] text-[#2D3339] border-[#BF8D61]" :
                "bg-[#F2ECE4] text-[#2D3339] border-[#D4CCB8]"
              }`}>
                {lot.status}
              </span>
              <span className="text-sm text-stone-500 font-bold">ID: {lot.id}</span>
            </div>
            <h3 className="font-display text-2xl font-black text-[#2D3339] mt-2 uppercase">
              Lote {lot.id.split("-")[1]} <span className="font-light text-[#C4A484]">({lot.quadrant})</span>
            </h3>
            <p className="text-sm text-stone-600 mt-0.5">
              Elevación Topo: <span className="text-[#C4A484] font-bold">{lot.elevation}m s.n.m</span>
            </p>
          </div>

          {/* Price tag */}
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Precio Adjudicado</p>
            <p className="font-display text-2xl font-black text-[#2D3339]">
              S/ {totalPrice.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-xs text-stone-500 mt-1">~ S/ {Math.round(totalPrice / lot.area).toLocaleString('es-PE')} / m²</p>
          </div>
        </div>

        {/* Technical Specifications Block (Architect/Engineer details) */}
        <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-none p-4 border border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Layers className="h-4 w-4 text-[#2D3339]" /> Área Lote
            </span>
            <p className="font-bold text-[#2D3339] text-base">{lot.area.toFixed(2)} m²</p>
            {lot.dimensions ? (
              <p className="text-[11px] text-stone-500 font-mono mt-2.5 leading-relaxed">
                Frente: {lot.dimensions.split(" x ")[0]} <br/>
                Fondo: {lot.dimensions.split(" x ")[1]}
              </p>
            ) : (
              <p className="text-[11px] text-stone-500 font-mono mt-2.5 leading-relaxed">
                Frente: 10.00m <br/>
                Fondo: {(lot.area / 10).toFixed(2)}m
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <SunDim className="h-4 w-4 text-[#C4A484]" /> Radiación Solar
            </span>
            <p className="font-bold text-[#2D3339] text-base">
              {peakSolarHours} <span className="text-xs font-normal">kWh/m²/día</span>
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Compass className="h-4 w-4 text-[#A3B18A]" /> Oasis Central
            </span>
            <p className="font-bold text-[#2D3339] text-base">~ {lot.distanceToPool} m</p>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
              <Layers className="h-4 w-4 text-[#E15A42]" /> Estacionamiento
            </span>
            <p className="font-bold text-[#E15A42] text-base">
              ~ {lot.hubDistance} m <span className="text-xs text-stone-500 font-normal">({Math.round(lot.hubDistance / 72)} min a pie)</span>
            </p>
          </div>
        </div>

        {/* Interactive Financial Simulator */}
        <div className="border border-stone-200 bg-white rounded-none p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b pb-3 border-stone-100">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#2D3339] flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#C4A484]" /> Simulador de Financiamiento
            </h4>
            <span className="rounded-none bg-[#6B8E23] px-2 py-0.5 text-xs font-bold text-white uppercase tracking-widest">
              Sin Intereses
            </span>
          </div>

          {/* Input: Downpayment % slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-bold leading-relaxed">Cuota Inicial ({downpaymentPercentage}%)</span>
              <span className="font-bold text-[#2D3339]">S/ {rawDownpayment.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              className="w-full accent-[#C4A484] h-2.5 cursor-pointer bg-stone-200 mt-2"
              value={downpaymentPercentage}
              onChange={(e) => setDownpaymentPercentage(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[11px] text-stone-500 pt-1 px-1">
              <span>10% (Mínimo)</span>
              <span>30% (Sugerido)</span>
              <span>100% (Contado)</span>
            </div>
          </div>

          {/* Input: Financing Months select */}
          <div className="space-y-1.5 font-mono">
            <label className="text-xs text-stone-600 font-bold flex items-center justify-between">
              <span>Plazo Mensual</span>
              <span className="font-bold text-[#C4A484]">{financingMonths} meses</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[6, 12, 18].map((m) => (
                <button
                  key={m}
                  onClick={() => setFinancingMonths(m)}
                  disabled={downpaymentPercentage === 100}
                  className={`py-1.5 rounded-none text-xs font-bold font-mono border-2 transition-all ${
                    downpaymentPercentage === 100
                      ? "opacity-30 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400"
                      : financingMonths === m
                      ? "bg-[#2D3339] border-[#2D3339] text-white"
                      : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Visualization */}
          {downpaymentPercentage < 100 && (
            <div className="h-32 mt-4 cursor-crosshair">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fill: '#888' }} 
                    height={20} 
                    angle={-30} 
                    textAnchor="end" 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} width={80} tickMargin={8} tickFormatter={(value) => `S/ ${value.toLocaleString()}`} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '0px', border: '2px solid #2D3339', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}
                    formatter={(value: number) => `S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  />
                  <Bar dataKey="base" stackId="a" fill="#C4A484" />
                  <Bar dataKey="fee" stackId="a" fill="#2D3339" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Financial Projection Output */}
          <div className="bg-[#F4F4F1] rounded-none p-3 border-2 border-dashed border-[#2D3339]/40 space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span>Separación hoy:</span>
              <span className="font-bold">S/ {separationFee.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center justify-between text-stone-700">
              <span>Inicial firma contrato:</span>
              <span className="font-bold text-[#2D3339]">
                S/ {downpaymentToPay.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
            {downpaymentPercentage < 100 ? (
              <>
                <div className="flex items-center justify-between text-stone-700">
                  <span>Monto a financiar:</span>
                  <span className="text-[#2D3339] font-bold">S/ {remainingFinanced.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pt-2 border-t border-[#2D3339]/10">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#C4A484]" />Cuota base mensual:</span>
                  <span>S/ {baseMonthly.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 pb-2">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#2D3339]" />Gastos admin. (5% Pasarela):</span>
                  <span>S/ {adminFeeMonthly.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <p className="text-[11px] text-stone-600 font-medium italic pb-1.5 text-center leading-relaxed">
                  *El gasto adm. del 5% cubre las comisiones de la pasarela de pagos (tarjetas crédito/débito) para la suscripción de cobro recurrente.
                </p>
                <div className="flex items-center justify-between font-bold border-t border-dashed border-[#2D3339]/20 pt-3 text-sm text-[#2D3339]">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-5 w-5 text-[#C4A484]" /> {financingMonths} Cuotas de:
                  </span>
                  <span className="font-display font-black text-xl text-[#2D3339]">
                    S/ {monthlyPayment.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </>
            ) : (
              <div className="font-bold border-t border-dashed border-[#2D3339]/20 pt-3 text-sm text-[#6B8E23] text-center uppercase tracking-wider">
                🎉 ¡Bono de Pago al Contado (100%) Aplicado!
              </div>
            )}
          </div>
        </div>

        {/* CTA Reservation Button */}
        {lot.status === "available" ? (
          <button
            onClick={() => onReserve(lot.id)}
            className="w-full rounded-none bg-[#C4A484] border-2 border-[#2D3339] py-4 text-sm font-bold text-[#2D3339] hover:bg-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_#2D3339] active:translate-y-1 active:shadow-[0px_0px_0px_#2D3339]"
          >
            <Landmark className="h-5 w-5" /> Separar Lote con S/ 1,000
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-none bg-stone-200 text-stone-400 py-4 text-sm font-bold cursor-not-allowed border-2 border-stone-300 uppercase tracking-widest"
          >
            No disponible para separación
          </button>
        )}

        {/* Informative safety note */}
        <div className="text-[11px] text-stone-600 font-medium text-center leading-relaxed mt-2 italic">
          * Las áreas definitivas están sujetas a la aprobación municipal del plano. Las cuotas son referenciales.
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

```

### Archivo: `src/components/ContractsSignature.tsx`
```tsx
import React, { useRef, useState, useEffect } from "react";
import { Lot } from "../types/map";
import { Lock, PenTool, CheckCircle, RefreshCw, Download, FileText, ShieldCheck, UserCheck, Stamp } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface ContractsSignatureProps {
  selectedLot: Lot | null;
  onSignatureSuccess: (message: string) => void;
}

export const ContractsSignature: React.FC<ContractsSignatureProps> = ({ selectedLot, onSignatureSuccess }) => {
  const [activeDoc, setActiveDoc] = useState<"contrato" | "disclosure">("contrato");
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Signature pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  
  // Signature status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedContract, setIsSignedContract] = useState(false);
  const [isSignedDisclosure, setIsSignedDisclosure] = useState(false);
  const [contractSignatureData, setContractSignatureData] = useState<string | null>(null);
  const [disclosureSignatureData, setDisclosureSignatureData] = useState<string | null>(null);
  const [securityHash, setSecurityHash] = useState<string | null>(null);
  const [signedDate, setSignedDate] = useState<string | null>(null);

  // Setup canvas drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeDoc, isSignedContract, isSignedDisclosure]);

  // Handle drawing events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch or mouse
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2D3339"; // dark slate ink
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLot) {
      alert("Por favor selecciona un lote en el masterplan superior para firmar.");
      return;
    }
    if (!fullName || !dni || !email || !phone) {
      alert("Por favor completa todos los datos obligatorios.");
      return;
    }
    if (!acceptedTerms) {
      alert("Debes aceptar la declaración de conformidad antes de firmar.");
      return;
    }
    if (!hasSigned) {
      alert("Por favor dibuja tu firma en el recuadro correspondiente.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay for secure signature creation
    setTimeout(async () => {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : "";
      
      const generatedHash = "SHA256-" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
      const currentDate = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });
      
      setSecurityHash(generatedHash);
      setSignedDate(currentDate);

      if (activeDoc === "contrato") {
        setIsSignedContract(true);
        setContractSignatureData(signatureDataUrl);
      } else {
        setIsSignedDisclosure(true);
        setDisclosureSignatureData(signatureDataUrl);
      }
      
      setIsSubmitting(false);
      clearCanvas();
      setAcceptedTerms(false);
      
      // Update Firestore if needed to block/reserve the lot under this name
      try {
        const lotRef = doc(db, "lots", selectedLot.id);
        await updateDoc(lotRef, {
          status: "blocked", // Lock the lot on successful signature
          priceLabel: "RESERVADO"
        });
      } catch (err) {
        console.warn("Firestore update omitted or failed:", err);
      }

      onSignatureSuccess(`¡Documento firmado digitalmente con éxito! Código Hash de Seguridad: ${generatedHash.substring(0, 15)}...`);
    }, 1800);
  };

  // Personalized Contract text
  const lotNumber = selectedLot?.number || "[___]";
  const lotArea = selectedLot?.area?.toFixed(2) || "250.00";
  const lotPrice = selectedLot?.price 
    ? "S/ " + selectedLot.price.toLocaleString('es-PE', { maximumFractionDigits: 0 })
    : "[___]";
  const lotQuadrant = selectedLot?.quadrant || "[___]";

  const getContractText = () => {
    return (
      <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-mono select-text bg-stone-50 p-5 border border-stone-200 h-[380px] overflow-y-auto">
        <p className="text-center font-bold text-sm text-[#2D3339] border-b pb-2 uppercase">
          CONTRATO DE INCORPORACION Y ADJUDICACION DE AREA DE USO EXCLUSIVO
        </p>
        <p className="text-center font-bold">MOON PARACAS — ETAPA FUNDADORA</p>
        
        <p><strong>I. IDENTIFICACIÓN DE LAS PARTES</strong></p>
        <p>
          <strong>LA ASOCIACIÓN:</strong> Asociación Civil de Adjudicatarios Moon Paracas, RUC N° 20123456789, inscrita en la Partida Electrónica N° 11223344 del Registro de Personas Jurídicas de Ica, con domicilio legal en Paracas, Km 245 Panamericana Sur, debidamente representada por su Presidente del Consejo Directivo.<br/>
          <strong>EL ASOCIADO:</strong> <strong>{fullName || "[Nombre Completo del Asociado]"}</strong>, identificado con DNI/CE N° <strong>{dni || "[Documento de Identidad]"}</strong>, con correo electrónico <strong>{email || "[Correo Electrónico]"}</strong> y teléfono celular/WhatsApp <strong>{phone || "[Número de Celular]"}</strong>.
        </p>

        <p><strong>II. ANTECEDENTES Y CLAUSULADO</strong></p>
        
        <p>
          <strong>PRIMERA. Antecedentes.</strong> LA ASOCIACIÓN administra y promueve el proyecto privado Moon Paracas, concebido como una comunidad rústica de campo de lujo y baja densidad, ubicado en el tablazo de Paracas, provincia de Pisco, departamento de Ica. El proyecto cuenta con espacios de uso exclusivo (lotes), áreas comunes (Oasis Central, sendero peatonal, vías de arcilla compactada), pórtico de control de accesos e iluminación eco-solar.
        </p>

        <p>
          <strong>SEGUNDA. Solicitud de incorporación.</strong> EL ASOCIADO solicita incorporarse a la asociación civil Moon Paracas, declarando haber recibido información comercial técnica previa y aceptar la naturaleza rústica, asociativa y progresiva del condominio.
        </p>

        <p>
          <strong>TERCERA. Aprobación y certificado.</strong> Aprobada la solicitud, LA ASOCIACIÓN emite a favor de EL ASOCIADO el Certificado de Incorporación de la Membresía para el Lote/Área de Uso Exclusivo asignado.
        </p>

        <p>
          <strong>CUARTA. Cuota de incorporación y Precio.</strong> La cuota de incorporación correspondiente al lote asignado asciende a la suma total de <strong>{lotPrice} Soles</strong>. EL ASOCIADO declara y acepta que el pago del 30% inicial se abonará al momento de la firma electrónica del presente contrato, dedonándose los S/ 1,000 en concepto de pre-reserva, y el saldo restante se cancelará en cuotas mensuales directas sin intereses de acuerdo al plazo pactado.
        </p>

        <p>
          <strong>QUINTA. Área de uso exclusivo.</strong> LA ASOCIACIÓN asigna a EL ASOCIADO el uso exclusivo del área interna identificada como <strong>Lote N° {lotNumber} (Sector: {lotQuadrant})</strong>, con un área neta aproximada de <strong>{lotArea} m²</strong>, conforme a la planimetría interna. Dicha asignación se realiza dentro del régimen privado de posesión del condominio y no equivale a una independización de partida registral inmediata.
        </p>

        <p>
          <strong>SEXTA. Naturaleza del derecho.</strong> EL ASOCIADO reconoce que su derecho se estructura como uso exclusivo y copropiedad interna sobre el lote matriz, sujeto al Reglamento Interno de Edificación y Coexistencia. Cualquier independización o formalización posterior se gestionará progresivamente ante las autoridades municipales competentes y Registros Públicos de Ica.
        </p>

        <p>
          <strong>SÉPTIMA. Desarrollo progresivo del proyecto.</strong> Moon Paracas se ejecuta por etapas, conforme a la disponibilidad de caja operativa (modelo de caja positiva), cobranza efectiva de los asociados y aprobaciones técnicas. El desarrollo de áreas recreativas comunes, piscina de piedra, PTAR, y pórtico se ejecutará progresivamente por hitos.
        </p>

        <p>
          <strong>OCTAVA. Cuotas ordinarias y de mantenimiento.</strong> EL ASOCIADO asume la obligación de pagar las cuotas mensuales de mantenimiento destinadas a la vigilancia 24/7, conservación de la piscina de piedra del Oasis, riego de senderos xerófitos y alumbrado solar común.
        </p>

        <p>
          <strong>NOVENA. Reglas de uso y construcción.</strong> Las viviendas deberán respetar obligatoriamente las especificaciones de diseño rústico de lujo: altura máxima de 2 pisos + azotea ligera (pérgola de eucalipto), colores de fachada terrosos (arena, terracota, ocre), cercos divisorios de piedra natural (pircas) de hasta 1.20m de altura, e instalación de sistemas solares fotovoltaicos para autoconsumo limpio.
        </p>

        <p>
          <strong>DÉCIMA. Solución de controversias.</strong> Cualquier discrepancia derivada de la ejecución del presente contrato se resolverá mediante trato directo y de mutuo acuerdo. En caso de desavenencia insalvable, las partes se someten al arbitraje institucional de la Cámara de Comercio de Ica.
        </p>

        <p className="pt-4 text-center font-bold">
          CONFORMIDAD Y FIRMA DIGITAL
        </p>
        <p>
          Las partes aceptan y suscriben de forma electrónica el presente contrato en señal de conformidad, certificando el proceso de firma digital mediante estampado seguro de Hash SHA256 y marca temporal.
        </p>
      </div>
    );
  };

  const getDisclosureText = () => {
    return (
      <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-mono select-text bg-stone-50 p-5 border border-stone-200 h-[380px] overflow-y-auto">
        <p className="text-center font-bold text-sm text-[#2D3339] border-b pb-2 uppercase">
          ANEXO DE RIESGOS Y DISCLOSURE — MOON PARACAS
        </p>
        <p className="text-center font-bold">DECLARACIÓN DE CONOCIMIENTO DEL ASOCIADO</p>
        
        <p><strong>I. NATURALEZA DEL PROYECTO</strong></p>
        <p>
          Moon Paracas es una comunidad privada rústica de baja densidad en el desierto, estructurada bajo un modelo asociativo con áreas de uso exclusivo, reglas internas de construcción y desarrollo progresivo por etapas. No debe interpretarse como una urbanización urbana convencional totalmente concluida al momento de la incorporación.
        </p>

        <p><strong>II. DECLARACIONES Y RIESGOS ACEPTADOS</strong></p>
        <p>
          EL ASOCIADO declara conocer, entender y aceptar los siguientes factores de riesgo vinculados al proyecto:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Independización registral:</strong> La subdivisión física y asignación de partidas registrales individuales para cada lote depende de la aprobación del catastro municipal y de Registros Públicos (Sunarp) Ica. No se garantiza una partida registral inmediata al momento de la incorporación comercial.
          </li>
          <li>
            <strong>Desarrollo progresivo (Caja Positiva):</strong> Las obras de infraestructura común (incluyendo el portal de eucalipto, la piscina de piedra del Oasis, los senderos y las redes de agua) se financian y ejecutan paulatinamente según la caja disponible de las cuotas de ingreso efectivas. El cronograma de hitos tiene carácter referencial.
          </li>
          <li>
            <strong>Servicios y Saneamiento:</strong> Los servicios en etapas tempranas serán autónomos y ecológicos. El asociado está obligado a instalar paneles solares en su vivienda para autoconsumo y un sistema de bio-digestor hermético homologado para tratamiento de aguas grises.
          </li>
          <li>
            <strong>Restricciones Arquitectónicas:</strong> Para proteger la plusvalía del condominio, toda edificación debe regirse estrictamente al reglamento (colores terrosos mate, pircas de piedra caliza, vigas de eucalipto, y xeripaisajismo). Se prohíbe pintura brillante, asfalto y ruidos vehiculares internos.
          </li>
          <li>
            <strong>Cota y Geografía de Tablazo:</strong> El terreno está ubicado a más de 106 metros s.n.m. en una meseta desértica. Si bien goza de una brisa marina constante y seguridad absoluta contra maremotos, el clima reporta ráfagas de viento (Vientos Paracas) de sur a norte, motivo por el cual el trazado vial es sinuoso para frenar la velocidad del viento.
          </li>
        </ol>

        <p><strong>III. DECLARACIÓN DE ACEPTACIÓN</strong></p>
        <p>
          EL ASOCIADO declara que comprende a cabalidad las condiciones informadas, y que basa su decisión de adhesión en los documentos contractuales físicos y digitales entregados, excluyendo cualquier oferta o compromiso verbal no documentado.
        </p>
      </div>
    );
  };

  return (
    <div id="contracts-signature-portal" className="rounded-none border border-stone-200 bg-white p-6 md:p-10 shadow-sm space-y-8 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="border-b border-stone-200 pb-5 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#2D3339] flex items-center justify-center lg:justify-start gap-3">
            <Lock className="h-7 w-7 text-[#C4A484]" />
            Portal Seguro de Firma Digital
          </h2>
          <p className="text-base text-stone-600 mt-2 max-w-2xl">
            Suscripción legal encriptada de contratos para adjudicación de lotes del condominio Moon Paracas.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex gap-3 text-[11px] font-bold font-mono">
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedContract ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-stone-50 border-stone-300 text-stone-500"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isSignedContract ? "bg-emerald-500" : "bg-stone-300"}`} />
            CONTRATO: {isSignedContract ? "FIRMADO" : "PENDIENTE"}
          </div>
          <div className={`px-3 py-1.5 border flex items-center gap-2 ${
            isSignedDisclosure ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-stone-50 border-stone-300 text-stone-500"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${isSignedDisclosure ? "bg-emerald-500" : "bg-stone-300"}`} />
            DISCLOSURE: {isSignedDisclosure ? "FIRMADO" : "PENDIENTE"}
          </div>
        </div>
      </div>

      {/* Selected Lot Warning */}
      {!selectedLot && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 text-amber-800 text-xs font-mono flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <span><strong>Atención:</strong> Debes seleccionar un lote primero en la pestaña "Masterplan" para pre-llenar los datos técnicos de tu contrato.</span>
        </div>
      )}

      {/* Main interface split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Document Viewer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Document selection buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDoc("contrato")}
              className={`px-4 py-2 text-xs font-bold font-mono border-2 transition-all flex items-center gap-2 ${
                activeDoc === "contrato"
                  ? "bg-[#2D3339] border-[#2D3339] text-white"
                  : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
              }`}
            >
              <FileText className="h-4 w-4" />
              1. Contrato Adjudicación
            </button>
            <button
              onClick={() => setActiveDoc("disclosure")}
              className={`px-4 py-2 text-xs font-bold font-mono border-2 transition-all flex items-center gap-2 ${
                activeDoc === "disclosure"
                  ? "bg-[#2D3339] border-[#2D3339] text-white"
                  : "bg-white border-[#2D3339] text-[#2D3339] hover:bg-[#F4F4F1]"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              2. Anexo de Riesgos
            </button>
          </div>

          {/* Render Contract Content */}
          <div className="relative">
            {activeDoc === "contrato" ? getContractText() : getDisclosureText()}
            
            {/* Stamp Overlay if already signed */}
            {((activeDoc === "contrato" && isSignedContract) || (activeDoc === "disclosure" && isSignedDisclosure)) && (
              <div className="absolute inset-0 bg-stone-900/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="bg-emerald-50 border-4 border-emerald-500 px-6 py-4 text-emerald-800 text-center shadow-lg max-w-[280px] -rotate-6 transform scale-110 pointer-events-auto">
                  <Stamp className="h-8 w-8 mx-auto mb-2 text-emerald-600 animate-bounce" />
                  <p className="font-sans text-sm font-black tracking-widest uppercase">Firmado Digitalmente</p>
                  <p className="font-mono text-[9px] mt-1 text-emerald-600 truncate">{securityHash}</p>
                  <p className="font-mono text-[8px] text-stone-500 mt-1">{signedDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Signed status and signature image display */}
          <div className="border border-stone-200 bg-stone-50 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-bold text-[#2D3339]">Validez e Integridad de la Firma:</p>
              <p className="text-[10px] text-stone-500 leading-normal max-w-sm">
                Las firmas digitales en Moon Paracas utilizan llaves encriptadas y sellado de tiempo de acuerdo a la Ley de Firmas y Certificados Digitales (Ley N° 27269).
              </p>
            </div>
            
            {/* Show signature graphic if signed */}
            {activeDoc === "contrato" && isSignedContract && contractSignatureData && (
              <div className="bg-white border border-stone-300 p-2 max-w-[120px] shadow-sm">
                <p className="text-[8px] text-stone-400 text-center font-mono border-b pb-1 mb-1">Firma Registrada</p>
                <img src={contractSignatureData} alt="Firma Contrato" className="h-10 w-full object-contain filter contrast-125" />
              </div>
            )}
            
            {activeDoc === "disclosure" && isSignedDisclosure && disclosureSignatureData && (
              <div className="bg-white border border-stone-300 p-2 max-w-[120px] shadow-sm">
                <p className="text-[8px] text-stone-400 text-center font-mono border-b pb-1 mb-1">Firma Registrada</p>
                <img src={disclosureSignatureData} alt="Firma Disclosure" className="h-10 w-full object-contain filter contrast-125" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Signing Pad & Verification Info */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          
          {/* Sign form block */}
          {((activeDoc === "contrato" && !isSignedContract) || (activeDoc === "disclosure" && !isSignedDisclosure)) ? (
            <form onSubmit={handleSubmitSignature} className="space-y-4 border-2 border-[#2D3339] p-5 bg-stone-50 shadow-[4px_4px_0px_#2D3339] h-full flex flex-col justify-between">
              
              <div className="space-y-3">
                <h3 className="font-display text-lg font-black text-[#2D3339] uppercase flex items-center gap-2 border-b pb-2 border-[#2D3339]/10">
                  <PenTool className="h-5 w-5 text-[#C4A484]" />
                  Completar Firma Digital
                </h3>
                
                {/* Form fields */}
                <div className="space-y-2 text-[10px] font-mono text-[#2D3339]">
                  
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[9px] text-stone-500">Nombre Completo del Adjudicatario *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza Quiroz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[9px] text-stone-500">DNI / CE / RUC *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 45678901"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[9px] text-stone-500">WhatsApp / Celular *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. +51 987 654 321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[9px] text-stone-500">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="carlos.mendoza@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs hover:bg-stone-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="font-bold uppercase text-[9px] text-[#C4A484] flex justify-between">
                      <span>Lote Vinculado</span>
                      <span>{selectedLot ? `ID: ${selectedLot.id}` : "Ninguno"}</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full rounded-none border border-[#2D3339] px-2.5 py-1.5 text-xs bg-stone-200 font-bold text-stone-600"
                      value={
                        selectedLot 
                          ? `Lote ${selectedLot.number} - ${selectedLot.quadrant} (${selectedLot.area.toFixed(2)} m²)`
                          : "Selecciona un lote en el masterplan superior"
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Signature Canvas Area */}
              <div className="space-y-2 mt-3 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#2D3339] font-bold">
                  <span className="uppercase text-stone-500">Dibuja tu firma aquí abajo *</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 focus:outline-none"
                  >
                    <RefreshCw className="h-3 w-3" /> BORRAR FIRMA
                  </button>
                </div>
                
                <div className="border-2 border-[#2D3339] bg-white cursor-crosshair relative h-36">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full block"
                  />
                  {!hasSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-300 font-mono text-[11px] uppercase tracking-widest">
                      Firmar con el mouse/dedo
                    </div>
                  )}
                </div>
              </div>

              {/* Accept check */}
              <div className="flex items-start gap-2.5 mt-4 text-[10px] font-mono text-stone-600">
                <input
                  type="checkbox"
                  required
                  id="chk-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[#C4A484] cursor-pointer"
                />
                <label htmlFor="chk-terms" className="leading-snug cursor-pointer select-none">
                  Acepto los términos del contrato y certifico que la firma dibujada corresponde a mi persona natural.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedLot}
                className="w-full bg-[#C4A484] border-2 border-[#2D3339] text-white font-bold text-xs py-3.5 px-6 uppercase tracking-widest hover:bg-[#b08e6e] transition-all shadow-[3px_3px_0px_#2D3339] active:translate-y-0.5 active:shadow-[1px_1px_0px_#2D3339] mt-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    GENERANDO SELLO CRYPTO...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    FIRMAR DOCUMENTO DIGITALMENTE
                  </>
                )}
              </button>
            </form>
          ) : (
            // Success State
            <div className="border-4 border-[#8C905C] bg-[#8C905C]/5 p-6 text-center space-y-6 shadow-lg h-full flex flex-col justify-center items-center">
              <CheckCircle className="h-16 w-16 text-[#8C905C] animate-pulse" />
              <div className="space-y-2">
                <h4 className="font-display text-xl font-black text-[#2D3339] uppercase tracking-wider">
                  ¡Documento Firmado!
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-mono max-w-sm">
                  El <strong>{activeDoc === "contrato" ? "Contrato de Adjudicación" : "Anexo de Riesgos"}</strong> ha sido firmado electrónicamente por <strong>{fullName}</strong> (DNI {dni}) el {signedDate}.
                </p>
              </div>

              {/* Cryptographic Stamp Card */}
              <div className="bg-[#2D3339] text-stone-100 p-4 border-2 border-[#C4A484] w-full text-left font-mono text-[9px] space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1 text-[#C4A484] font-bold uppercase tracking-wider border-b border-stone-700 pb-1 mb-1">
                  <Stamp className="h-3.5 w-3.5" /> Certificado de Firma Digital
                </div>
                <div><span className="text-stone-400">HASH:</span> <span className="text-emerald-400">{securityHash}</span></div>
                <div><span className="text-stone-400">FECHA:</span> {signedDate}</div>
                <div><span className="text-stone-400">ASOCIADO:</span> {fullName}</div>
                <div><span className="text-stone-400">DNI:</span> {dni}</div>
                <div><span className="text-stone-400">LOTE:</span> Lote {selectedLot?.number} ({selectedLot?.quadrant})</div>
                <div><span className="text-stone-400">VALIDEZ:</span> CONSTITUCIÓN FIRME EN CATASTRO</div>
              </div>

              {/* Options */}
              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={() => {
                    // Reset signature to let them sign the other document
                    if (activeDoc === "contrato") {
                      setActiveDoc("disclosure");
                    } else {
                      setActiveDoc("contrato");
                    }
                    setHasSigned(false);
                  }}
                  className="w-full bg-[#2D3339] text-white border-2 border-[#2D3339] py-3 text-xs font-bold font-mono tracking-wider hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-[#C4A484]" />
                  FIRMAR SIGUIENTE DOCUMENTO
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-white text-[#2D3339] border-2 border-[#2D3339] py-3 text-xs font-bold font-mono tracking-wider hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4 text-[#C4A484]" />
                  IMPRIMIR CONSTANCIA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

```

### Archivo: `src/lib/lotModel.ts`
```tsx
import { BlockPolygon, Lot, LotStatus, LotTypology, XY } from "../types/map";
import { BLOCK_SPECS } from "../data/business";
import { shoelaceArea, centroid } from "./geometry";
import { getMeterToSvgScale, buildTerrainScene } from "./terrainModel";
import { slicePolyRing, getPointOnPoly, getPointAndNormalOnPoly } from "./curve";
import { BAND_BLOCKS, BAND_OFFSETS, getBandPoint, globalOasisBoundary } from "./blockModel";
import { checkCollision } from "./spatialAnalyzer";


function makeLotId(n: number) {
  return `L${String(n).padStart(3, "0")}`;
}

function inferStatus(n: number): LotStatus {
  // Oferta comercial etapa 30 lotes a S/ 50. Elegimos un bloque consecutivo o intercalado.
  // We'll pick 30 specific lots to be on "offer" (e.g. from 20 to 49)
  if (n >= 20 && n <= 49) return "offer";
  return "available";
}

// Ray-polyline intersection
function getRayPolylineIntersection(rayStart: XY, rayDir: XY, polyline: XY[]): XY | null {
  let minT = Infinity;
  let intersectPt: XY | null = null;

  for (let i = 0; i < polyline.length; i++) {
    const A = polyline[i];
    const B = polyline[(i + 1) % polyline.length];
    const v = { x: B.x - A.x, y: B.y - A.y };

    const cross_d_v = rayDir.x * v.y - rayDir.y * v.x;
    if (Math.abs(cross_d_v) < 1e-9) continue; // Parallel

    const cross_ap_v = (A.x - rayStart.x) * v.y - (A.y - rayStart.y) * v.x;
    const cross_ap_d = (A.x - rayStart.x) * rayDir.y - (A.y - rayStart.y) * rayDir.x;

    const t = cross_ap_v / cross_d_v;
    const u = cross_ap_d / cross_d_v;

    if (t >= 0 && u >= 0 && u <= 1) {
      if (t < minT) {
        minT = t;
        intersectPt = {
          x: rayStart.x + t * rayDir.x,
          y: rayStart.y + t * rayDir.y
        };
      }
    }
  }

  return intersectPt;
}

function projectPointAlongNormalToPoly(
  pt: XY,
  normal: XY,
  center: XY,
  polyline: XY[],
  fallbackT: number
): XY {
  const intersect = getRayPolylineIntersection(pt, normal, polyline);
  if (intersect) return intersect;

  // Fallback 1: Project towards the center of gravity
  const dir = { x: center.x - pt.x, y: center.y - pt.y };
  const fallbackIntersect = getRayPolylineIntersection(pt, dir, polyline);
  if (fallbackIntersect) return fallbackIntersect;

  // Fallback 2: Direct parametric point
  return getPointOnPoly(polyline, fallbackT);
}

// Parallel block subdivision (1 row per block, aligned t-cuts)
function subdivideParallelBlock(block: BlockPolygon, count: number): XY[][] {
  if (!block.ringData) return [block.polygon];
  
  const { t_start, t_end } = block.ringData;
  const scale = getMeterToSvgScale();
  const { innerBuffer } = buildTerrainScene();
  
  // Find band index and offsets
  const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
  const offsets = BAND_OFFSETS[b];
  if (!offsets) return [block.polygon];
  
  const lots: XY[][] = [];
  
  // 4m wide pedestrian gap in t (approx 0.012 on t-axis)
  const gap_t = 0.012;
  const L_t = t_end - t_start;
  const isTinyHouseBlock = ["M4", "M5", "M6", "M19", "M20", "M21"].includes(block.id);
  const effectiveCount = isTinyHouseBlock ? Math.floor(count / 2) : count;
  const dt = (L_t - gap_t) / effectiveCount;
  const half = Math.floor(effectiveCount / 2);
  
  // Helper to compute t value for each cut index
  const getTVal = (idx: number) => {
    let t_base = (idx <= half) ? t_start + idx * dt : t_start + idx * dt + gap_t;
    const isOrganic = ["M2", "M5", "M8", "M17", "M20", "M23"].includes(block.id);
    if (isOrganic && idx > 0 && idx < effectiveCount) {
      t_base += 0.007 * Math.sin(idx * 2.5);
    }
    return t_base;
  };
  
  // Helper to compute d shifts for each cut index (set to 0 for clean straight boundaries)
  const getShiftLow = (idx: number) => {
    return 0;
  };
  
  const getShiftHigh = (idx: number) => {
    return 0;
  };
  
  for (let c = 0; c < effectiveCount; c++) {
    const t1 = getTVal(c);
    const t2 = getTVal(c + 1);
    
    let d1_low  = offsets.low + getShiftLow(c);
    let d2_low  = offsets.low + getShiftLow(c + 1);
    let d2_high = offsets.high + getShiftHigh(c + 1);
    let d1_high = offsets.high + getShiftHigh(c);
    
    // Dynamic adjustments for Band 4 (M10-M12)
    if (b === 3) {
      d1_high = 103 - Math.max(0, 14 * Math.sin(3 * Math.PI * t1));
      d2_high = 103 - Math.max(0, 14 * Math.sin(3 * Math.PI * t2));
    }
    // Dynamic adjustments for Band 5 (M13-M15)
    if (b === 4) {
      d1_low = 128 + Math.max(0, 14 * Math.sin(3 * Math.PI * t1));
      d2_low = 128 + Math.max(0, 14 * Math.sin(3 * Math.PI * t2));
    }
    
    const slope = (block.ringData?.isFirstRow) 
        ? ((block.ringData.t_start_high ?? t_start) - (block.ringData.t_start_low ?? t_start)) 
        : 0;
        
    const getOffsetForT = (t_val: number) => {
      const progress = (t_val - t_start) / L_t;
      return slope * Math.max(0, Math.min(1, 1 - progress));
    };

    let current_t1_low = t1;
    let current_t1_high = t1 + getOffsetForT(t1);
    
    // For the back edge of the lot
    let current_t2_low = t2;
    let current_t2_high = t2 + getOffsetForT(t2);

    // Exact override for the very first lot to perfectly seal the block boundary
    if (c === 0 && block.ringData?.isFirstRow) {
       current_t1_low = block.ringData.t_start_low ?? current_t1_low;
       current_t1_high = block.ringData.t_start_high ?? current_t1_high;
    }

    const p1 = getBandPoint(innerBuffer, current_t1_low, d1_low,  scale);
    const p2 = getBandPoint(innerBuffer, current_t2_low, d2_low,  scale);
    const p3 = getBandPoint(innerBuffer, current_t2_high, d2_high, scale);
    const p4 = getBandPoint(innerBuffer, current_t1_high, d1_high, scale);
    
    if (isTinyHouseBlock) {
      const d1_mid = (d1_low + d1_high) / 2;
      const d2_mid = (d2_low + d2_high) / 2;
      
      const current_t1_mid = (current_t1_low + current_t1_high) / 2;
      const current_t2_mid = (current_t2_low + current_t2_high) / 2;
      
      const p1a = p1;
      const p2a = p2;
      const p3a = getBandPoint(innerBuffer, current_t2_mid, d2_mid, scale);
      const p4a = getBandPoint(innerBuffer, current_t1_mid, d1_mid, scale);
      
      const p1b = p4a;
      const p2b = p3a;
      const p3b = p3;
      const p4b = p4;
      
      lots.push([p1a, p2a, p3a, p4a]);
      lots.push([p1b, p2b, p3b, p4b]);
    } else {
      if (b === 3) {
        // Curve along d_high (from p3 back to p4, i.e. current_t2_high to current_t1_high)
        const curvedEdge: XY[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const curr_t = current_t2_high + (current_t1_high - current_t2_high) * (s / steps);
          const scallop = 14 * Math.sin(3 * Math.PI * curr_t);
          const curr_d = 103 - Math.max(0, scallop);
          curvedEdge.push(getBandPoint(innerBuffer, curr_t, curr_d, scale));
        }
        lots.push([p1, p2, ...curvedEdge]);
      } else if (b === 4) {
        // Curve along d_low (from p1 to p2, i.e. current_t1_low to current_t2_low)
        const curvedEdge: XY[] = [];
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const curr_t = current_t1_low + (current_t2_low - current_t1_low) * (s / steps);
          const scallop = 14 * Math.sin(3 * Math.PI * curr_t);
          const curr_d = 128 + Math.max(0, scallop);
          curvedEdge.push(getBandPoint(innerBuffer, curr_t, curr_d, scale));
        }
        lots.push([...curvedEdge, p3, p4]);
      } else {
        lots.push([p1, p2, p3, p4]);
      }
    }
  }
  
  return lots;
}

function getLotCorners(polygon: XY[], b: number): { p1: XY; p2: XY; p3: XY; p4: XY } {
  if (polygon.length === 4) {
    return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[3] };
  }
  if (b === 3) {
    // [p1, p2, ...curvedEdge] where curvedEdge starts at p3 and ends at p4
    return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[polygon.length - 1] };
  }
  if (b === 4) {
    // [...curvedEdge, p3, p4] where curvedEdge starts at p1 and ends at p2 (13 elements, index 0 to 12)
    return { p1: polygon[0], p2: polygon[12], p3: polygon[13], p4: polygon[14] };
  }
  return { p1: polygon[0], p2: polygon[1], p3: polygon[2], p4: polygon[3] };
}

export function buildLots(blocks: BlockPolygon[], parkings?: Lot[]): Lot[] {
  let counter = 1;
  let premiumCounter = 0;
  const lots: Lot[] = [];
  const scale = getMeterToSvgScale();

  // Helper to compute minimum distance from a point to a polygon of vertices
  function distanceToPolygon(p: XY, poly: XY[]): number {
    if (poly.length === 0) return 100; // default fallback
    let minD = Infinity;
    for (const pt of poly) {
      const d = Math.hypot(p.x - pt.x, p.y - pt.y);
      if (d < minD) minD = d;
    }
    return minD;
  }

  for (const block of blocks) {
    const spec = BLOCK_SPECS.find(b => b.id === block.id);
    if (!spec) continue;
    
    const b = BAND_BLOCKS.findIndex(arr => arr.includes(block.id));
    
    const mix: LotTypology[] = [
      ...Array(spec.lotMix.standard || 0).fill("standard"),
      ...Array(spec.lotMix.premium || 0).fill("premium"),
      ...Array(spec.lotMix.adjustment || 0).fill("adjustment"),
      ...Array(spec.lotMix.zen || 0).fill("zen")
    ];
    mix.sort((a, b) => a.localeCompare(b)); 

    const subPolygons = subdivideParallelBlock(block, spec.targetLotCount);

    for (let i = 0; i < spec.targetLotCount; i++) {
      const polygon = subPolygons[i] || block.polygon;
      
      // True mathematically computed area in square meters
      const svgArea = shoelaceArea(polygon);
      const realArea = svgArea / (scale * scale);
      const roundedArea = Math.round(realArea * 100) / 100;

      let dimensions = "";
      if (polygon.length >= 4) {
        const corners = getLotCorners(polygon, b);
        const left = Math.hypot(corners.p4.x - corners.p1.x, corners.p4.y - corners.p1.y) / scale;
        const right = Math.hypot(corners.p2.x - corners.p3.x, corners.p2.y - corners.p3.y) / scale;
        const avgDepth = (left + right) / 2;
        
        let bestW = 10;
        let bestH = 10;
        let minDiff = Infinity;
        
        const hStart = Math.max(1, avgDepth - 0.5);
        const hEnd = avgDepth + 0.5;
        for (let testH = hStart; testH <= hEnd; testH += 0.1) {
          const h_rounded = Math.round(testH * 10) / 10;
          const w_rounded = Math.round((roundedArea / h_rounded) * 10) / 10;
          const diff = Math.abs(w_rounded * h_rounded - roundedArea);
          if (diff < minDiff) {
            minDiff = diff;
            bestW = w_rounded;
            bestH = h_rounded;
          }
        }
        dimensions = `${bestW.toFixed(1)}m x ${bestH.toFixed(1)}m`;
      }

      // Assign commercial typology
      let finalTypology: LotTypology = "standard";
  
      // Tiny House: Longitudinal split
      if (["M4", "M5", "M6", "M19", "M20", "M21"].includes(block.id)) {
        finalTypology = "tiny-house";
      }
      // Premium: Lots directly facing the Oasis (inner-ring blocks M10-M15)
      else if (["M10", "M11", "M12", "M13", "M14", "M15"].includes(block.id)) {
        finalTypology = "premium";
      } 
      // Adjustment/Irregular: The sharp tips of the diamond terrain
      else if (["M1", "M3", "M22", "M24"].includes(block.id)) {
        finalTypology = "adjustment";
      }
      // Zen: The organic domo villages
      else if (["M2", "M8", "M17", "M23"].includes(block.id)) {
        finalTypology = "zen";
      }

      let status: LotStatus = "available";
      if (counter <= 30) {
        if (counter <= 5) {
          status = "blocked"; // 5 separados
        } else if (counter <= 8) {
          status = "sold";    // 3 vendidos
        } else {
          status = "offer";   // 22 en oferta
        }
      } else {
        if (finalTypology === "premium") {
          premiumCounter++;
          if (premiumCounter <= 31) {
            status = "blocked"; // 60% of premium blocked
          } else {
            status = "available";
          }
        } else {
          status = "available";
        }
      }

      const rate = counter <= 30 ? 60 : 120;
      const price = Math.round(roundedArea * rate);
      const priceLabel = `S/ ${price.toLocaleString('en-US', {maximumFractionDigits:0})}`;

      // Mathematical distances
      const lotCentroid = centroid(polygon);
      const distToPool = Math.round(distanceToPolygon(lotCentroid, globalOasisBoundary) / scale);

      let minParkDist = 100; // fallback
      if (parkings && parkings.length > 0) {
        let minD = Infinity;
        for (const p of parkings) {
          const pCentroid = centroid(p.polygon);
          const d = Math.hypot(lotCentroid.x - pCentroid.x, lotCentroid.y - pCentroid.y);
          if (d < minD) minD = d;
        }
        minParkDist = Math.round(minD / scale);
      }

      lots.push({
        id: makeLotId(counter),
        blockId: block.id,
        typology: finalTypology,
        status: status,
        areaM2: roundedArea,
        polygon: polygon,
        dimensions: dimensions,
        priceLabel: priceLabel,
        price: price,
        number: counter,
        quadrant: block.id,
        area: roundedArea,
        elevation: 108 + Math.floor(Math.random() * 5),
        distanceToPool: distToPool,
        hubDistance: minParkDist
      });

      counter++;
    }
  }

  return lots;
}

export function buildParkingLots(innerBuffer: XY[], obstacles: XY[][] = []): Lot[] {
  const scale = getMeterToSvgScale();
  const lots: Lot[] = [];
  let parkingCount = 1;

  function getMaxTForD(d: number): number {
    if (d <= 20) return 0.145;
    if (d <= 46) return 0.115;
    if (d <= 72) return 0.075;
    if (d <= 98) return 0.035;
    
    if (d >= 133 && d <= 153) return 0.035;
    if (d > 153 && d <= 179) return 0.075;
    if (d > 179 && d <= 205) return 0.115;
    if (d > 205 && d <= 231) return 0.145;
    
    return 0;
  }

  function createParkingLot(prefix: string, rowDef: {tCenter: number}, dCenter: number, typology: LotTypology = "parking"): Lot {
    const center = getBandPoint(innerBuffer, rowDef.tCenter, dCenter, scale);
    const nextP = getBandPoint(innerBuffer, rowDef.tCenter, dCenter + 1, scale);
    const angle = Math.atan2(nextP.y - center.y, nextP.x - center.x);
    
    // True Cartesian dimensions: 2.5m wide x 5m deep
    const wPx = (2.5 * scale) / 2;
    const dPx = (5.0 * scale) / 2;

    const corners = [
      { x: -wPx, y: -dPx },
      { x:  wPx, y: -dPx },
      { x:  wPx, y:  dPx },
      { x: -wPx, y:  dPx },
    ];

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const polygon = corners.map(c => ({
      x: center.x + c.x * cosA - c.y * sinA,
      y: center.y + c.x * sinA + c.y * cosA
    }));
    
    const idNum = parkingCount++;
    return {
      id: `P-${prefix}${idNum}`,
      number: `P${idNum}`,
      blockId: "PARKING",
      typology: typology,
      areaM2: 12.5,
      status: "available",
      priceLabel: typology === "parking-external" ? "PÚBLICO" : "S/ 5,000",
      price: typology === "parking-external" ? 0 : 5000,
      polygon: polygon,
      dimensions: "2.5m x 5.0m",
      quadrant: "PARKING",
      area: 12.5,
      elevation: 108,
      distanceToPool: 50,
      hubDistance: 0
    };
  }

  function fillParkingStrips(dStart: number, dEnd: number, prefix: string) {
    for (let d = dStart; d <= dEnd; d += 2.5) {
      if (d % 20 > 15) continue; // Leave gaps for driveways
      let currentT = 0.035; 
      const boundaryT = getMaxTForD(d + 1.25) - 0.005; 

      while (currentT <= boundaryT) {
         const p1 = createParkingLot(prefix, {tCenter: currentT}, d + 1.25);
         if (!checkCollision(p1.polygon, obstacles)) lots.push(p1);
         
         // Aisle of 6.5 meters between rows facing each other (0.018 in t-space + 2 half spots = 0.032)
         let nextT = currentT + 0.032; 
         if (nextT <= boundaryT) {
            const p2 = createParkingLot(prefix, {tCenter: nextT}, d + 1.25);
            if (!checkCollision(p2.polygon, obstacles)) lots.push(p2);
         }

         // Back to back gap of 0 meters between blocks (0.014 in t-space)
         currentT = nextT + 0.014; 
      }
    }
  }

  // Left side internal parking block: clear of entrance (d=15 to 92.5)
  fillParkingStrips(15, 92.5, "L1-");

  // Right side internal parking block: safe after d=137.5
  fillParkingStrips(137.5, 225, "R");

  // External Visitor Parking (setback outside front wall)
  let extCount = 0;
  function fillExternalParking(dStart: number, dEnd: number, prefix: string) {
    for (let d = dStart; d <= dEnd; d += 2.5) {
      extCount++;
      const p = createParkingLot(prefix, {tCenter: -0.012}, d + 1.25, "parking-external");
      if (!checkCollision(p.polygon, obstacles)) lots.push(p);
    }
  }

  // Add external visitor parking along the setback
  fillExternalParking(15, 90, "EXT-L-");
  fillExternalParking(135, 215, "EXT-R-");

  console.log(`Generated ${extCount} external visitor parking spots outside the wall.`);

  return lots;
}

```

