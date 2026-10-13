import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Building2,
  FileCheck,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Printer,
  Copy,
  Check,
  LogOut,
  Shield,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  Award,
  UserPlus,
  MapPin,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import {
  STANDARD_LOT_AREA_M2,
  STANDARD_LOT_PRICE_USD,
  STANDARD_LOT_PRICE_PEN,
  DOUBLE_LOT_AREA_M2,
  DOUBLE_LOT_PRICE_USD,
  LOT_PRICE_PER_M2_USD,
  USD_TO_PEN_RATE,
  formatUsdAmount,
  formatPenAmount,
  getDirectFinanceMonthlyUSD,
} from "../config/pricing";
import { CONSOLIDATED_INVENTORY, ConsolidatedLot } from "../data/consolidatedInventory";
import { PROJECT } from "../config/project";

export interface LeadData {
  id: string;
  name: string;
  email?: string;
  phone: string;
  message?: string;
  selectedLotId?: string;
  projectInterest?: string;
  inquiryType?: string;
  contactWindow?: string;
  district?: string;
  pipelineStage: "new" | "contacted" | "visit_scheduled" | "reservation_pending" | "closed_won" | "discarded";
  slaTargetMinutes?: number;
  channel?: string;
  attribution?: {
    source?: string;
    medium?: string;
    campaign?: string;
    landingPath?: string;
  };
  createdAt?: any;
  advisorNotes?: string;
}

export function CrmIntranet() {
  // Autenticación de Asesor
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("moon_crm_auth") === "true";
  });
  const [accessPin, setAccessPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [advisorName, setAdvisorName] = useState(() => {
    return sessionStorage.getItem("moon_advisor_name") || "Asesor Comercial Senior";
  });

  // Tab actual: "pipeline" | "inventory" | "proforma" | "commissions"
  const [activeTab, setActiveTab] = useState<"pipeline" | "inventory" | "proforma" | "commissions">("pipeline");

  // Leads reales desde Firestore (CERO data simulada)
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [searchLead, setSearchLead] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "Santiago de Surco",
    selectedLotId: "L001",
    inquiryType: "reservation",
    message: "",
  });

  // Overrides de estado de lotes del inventario oficial de 450 lotes
  const [lotStatusOverrides, setLotStatusOverrides] = useState<Record<string, "available" | "reserved" | "sold">>(() => {
    const saved = localStorage.getItem("moon_consolidated_lot_overrides");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Inicializar con los estados oficiales del Excel consolidado
    const initial: Record<string, "available" | "reserved" | "sold"> = {};
    CONSOLIDATED_INVENTORY.forEach((lot) => {
      if (lot.officialStatus === "Vendido") initial[lot.id] = "sold";
      else if (lot.officialStatus === "Separado") initial[lot.id] = "reserved";
    });
    return initial;
  });

  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryBlockFilter, setInventoryBlockFilter] = useState<string>("all");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>("all");
  const [inventoryTypologyFilter, setInventoryTypologyFilter] = useState<string>("all");

  // Cotizador Express / Proforma oficial
  const [proformaClientName, setProformaClientName] = useState("");
  const [proformaClientDni, setProformaClientDni] = useState("");
  const [proformaClientPhone, setProformaClientPhone] = useState("");
  const [proformaLotId, setProformaLotId] = useState("L001");
  const [proformaDownRatio, setProformaDownRatio] = useState(0.3); // 30% inicial
  const [proformaMonths, setProformaMonths] = useState(36);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Escuchar Leads reales en tiempo real desde Firestore
  useEffect(() => {
    let unsub = () => {};
    try {
      const leadsCol = collection(db, "leads");
      const q = query(leadsCol, orderBy("createdAt", "desc"), limit(100));
      unsub = onSnapshot(
        q,
        (snap) => {
          const fetched: LeadData[] = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as any),
          }));
          setLeads(fetched);
        },
        (error) => {
          console.warn("Firestore leads snapshot listener notice:", error);
        }
      );
    } catch (e) {
      console.warn("Offline Firestore mode:", e);
    }
    return () => unsub();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessPin === "moon2026" || accessPin === "paracas" || accessPin === "2026") {
      sessionStorage.setItem("moon_crm_auth", "true");
      sessionStorage.setItem("moon_advisor_name", advisorName);
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("moon_crm_auth");
    setIsAuthenticated(false);
  };

  // Crear lead manual
  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const leadPayload = {
      name: newLeadForm.name.trim(),
      phone: newLeadForm.phone.trim(),
      email: (newLeadForm.email || "").trim().toLowerCase(),
      district: newLeadForm.district,
      selectedLotId: newLeadForm.selectedLotId,
      message: newLeadForm.message.trim(),
      projectInterest: "Moon Paracas",
      inquiryType: newLeadForm.inquiryType,
      contactWindow: "morning",
      pipelineStage: "new" as const,
      slaTargetMinutes: 15,
      channel: "crm-manual-entry",
      advisorNotes: `Registrado manualmente por: ${advisorName}`,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "leads"), leadPayload);
      const newLead: LeadData = {
        id: docRef.id,
        ...leadPayload,
        createdAt: new Date(),
      };
      setLeads((prev) => [newLead, ...prev]);
    } catch (err) {
      // Guardar localmente
      const localLead: LeadData = {
        id: `manual-${Date.now()}`,
        ...leadPayload,
        createdAt: new Date(),
      };
      setLeads((prev) => [localLead, ...prev]);
    }

    setNewLeadForm({
      name: "",
      phone: "",
      email: "",
      district: "Santiago de Surco",
      selectedLotId: "L001",
      inquiryType: "reservation",
      message: "",
    });
    setShowAddLeadModal(false);
  };

  // Actualizar etapa de pipeline de un lead
  const updateLeadStage = async (leadId: string, newStage: LeadData["pipelineStage"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: newStage } : l))
    );
    try {
      const docRef = doc(db, "leads", leadId);
      await updateDoc(docRef, { pipelineStage: newStage });
    } catch {
      // Estado local actualizado
    }
  };

  // Actualizar estado de un lote del inventario oficial
  const toggleLotStatus = (lotId: string, newStatus: "available" | "reserved" | "sold") => {
    const updated = { ...lotStatusOverrides, [lotId]: newStatus };
    setLotStatusOverrides(updated);
    localStorage.setItem("moon_consolidated_lot_overrides", JSON.stringify(updated));
  };

  // Lista consolidada de lotes con estados en vivo
  const allLots = useMemo(() => {
    return CONSOLIDATED_INVENTORY.map((lot) => {
      const override = lotStatusOverrides[lot.id];
      const effectiveStatus: "available" | "reserved" | "sold" = override || lot.status;
      return {
        ...lot,
        effectiveStatus,
      };
    });
  }, [lotStatusOverrides]);

  // Lista de manzanas únicas
  const allBlocks = useMemo(() => {
    return Array.from(new Set(CONSOLIDATED_INVENTORY.map((l) => l.block))).sort();
  }, []);

  // Lista de tipologías únicas
  const allTypologies = useMemo(() => {
    return Array.from(new Set(CONSOLIDATED_INVENTORY.map((l) => l.typology)));
  }, []);

  // Cálculos de KPIs Oficiales
  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.pipelineStage === "new").length;
    const totalLotsCount = allLots.length;
    const soldLotsCount = allLots.filter((l) => l.effectiveStatus === "sold").length;
    const reservedLotsCount = allLots.filter((l) => l.effectiveStatus === "reserved").length;
    const availableLotsCount = allLots.filter((l) => l.effectiveStatus === "available").length;
    const totalAreaM2 = allLots.reduce((acc, l) => acc + l.areaM2, 0);
    const pipelineUsd = leads.filter((l) => l.pipelineStage !== "discarded").length * STANDARD_LOT_PRICE_USD;

    return {
      totalLeads,
      newLeads,
      totalLotsCount,
      soldLotsCount,
      reservedLotsCount,
      availableLotsCount,
      totalAreaM2: Math.round(totalAreaM2),
      pipelineUsd,
    };
  }, [leads, allLots]);

  // Filtrado de Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchLead.toLowerCase()) ||
        lead.phone.includes(searchLead) ||
        (lead.selectedLotId && lead.selectedLotId.toLowerCase().includes(searchLead.toLowerCase()));
      const matchesStage = stageFilter === "all" || lead.pipelineStage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, searchLead, stageFilter]);

  // Filtrado de Inventario Oficial (450 Lotes)
  const filteredInventory = useMemo(() => {
    return allLots.filter((lot) => {
      const matchesSearch =
        lot.id.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        lot.name.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesBlock = inventoryBlockFilter === "all" || lot.block === inventoryBlockFilter;
      const matchesStatus =
        inventoryStatusFilter === "all" || lot.effectiveStatus === inventoryStatusFilter;
      const matchesTypology =
        inventoryTypologyFilter === "all" || lot.typology === inventoryTypologyFilter;
      return matchesSearch && matchesBlock && matchesStatus && matchesTypology;
    });
  }, [allLots, inventorySearch, inventoryBlockFilter, inventoryStatusFilter, inventoryTypologyFilter]);

  // Lote de la Proforma seleccionada
  const selectedProformaLot = useMemo(() => {
    return allLots.find((l) => l.id === proformaLotId) || allLots[0];
  }, [allLots, proformaLotId]);

  // Cálculos de Proforma
  const proformaCalculations = useMemo(() => {
    const priceUsd = selectedProformaLot.priceUsd;
    const pricePen = selectedProformaLot.pricePen;
    const downPaymentUsd = Math.round(priceUsd * proformaDownRatio);
    const downPaymentPen = Math.round(pricePen * proformaDownRatio);
    const financedUsd = priceUsd - downPaymentUsd;
    const monthlyInstallmentUsd = Math.round(financedUsd / proformaMonths);
    const monthlyInstallmentPen = Math.round(monthlyInstallmentUsd * USD_TO_PEN_RATE);
    const reservationPen = 1000;
    const reservationUsd = Math.round(reservationPen / USD_TO_PEN_RATE);

    return {
      priceUsd,
      pricePen,
      downPaymentUsd,
      downPaymentPen,
      financedUsd,
      monthlyInstallmentUsd,
      monthlyInstallmentPen,
      reservationPen,
      reservationUsd,
    };
  }, [selectedProformaLot, proformaDownRatio, proformaMonths]);

  // Copiar resumen de proforma para WhatsApp
  const handleCopyQuoteToClipboard = () => {
    const clientHeader = proformaClientName ? `👤 *Cliente:* ${proformaClientName}\n` : "";
    const text = `🌕 *COTIZACIÓN OFICIAL — MOON PARACAS* 🌴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clientHeader}📍 *Lote Seleccionado:* ${selectedProformaLot.id} (${selectedProformaLot.name}) · Manzana ${selectedProformaLot.block}
📐 *Área Oficial:* ${selectedProformaLot.areaM2.toFixed(2)} m² (${selectedProformaLot.dimensions})
🏠 *Tipología:* ${selectedProformaLot.typology}
💰 *Precio Total de Preventa:* $${proformaCalculations.priceUsd.toLocaleString()} USD (~S/ ${proformaCalculations.pricePen.toLocaleString()} PEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *PLAN DE FINANCIAMIENTO DIRECTO:*
• *Separación Notarial:* S/ ${proformaCalculations.reservationPen} PEN (~$${proformaCalculations.reservationUsd} USD)
• *Inicial (${Math.round(proformaDownRatio * 100)}%):* $${proformaCalculations.downPaymentUsd.toLocaleString()} USD (~S/ ${proformaCalculations.downPaymentPen.toLocaleString()} PEN)
• *Saldo a Financiar:* $${proformaCalculations.financedUsd.toLocaleString()} USD
• *Cuotas Mensuales (${proformaMonths} meses sin intereses):* *$${proformaCalculations.monthlyInstallmentUsd} USD / mes* (~S/ ${proformaCalculations.monthlyInstallmentPen} PEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *Seguridad Jurídica:* Asociación & Adjudicación Notarial de Área de Uso Exclusivo. Lote matriz de 11.26 ha georreferenciado con coordenadas oficiales UTM 18S.
📲 *Asesor Responsable:* ${advisorName} · Moon Paracas`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // Cargar datos desde un lead existente en el cotizador
  const handleLoadLeadIntoProforma = (lead: LeadData) => {
    setProformaClientName(lead.name);
    setProformaClientPhone(lead.phone);
    if (lead.selectedLotId && allLots.some((l) => l.id === lead.selectedLotId)) {
      setProformaLotId(lead.selectedLotId);
    }
    setActiveTab("proforma");
  };

  // ── PANTALLA DE ACCESO (GATEWAY PRIVADO) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#161310] flex items-center justify-center p-4 selection:bg-[#C85B3E] selection:text-white">
        <div className="w-full max-w-md rounded-3xl border border-[#C5A059]/40 bg-[#1F1B17] p-8 shadow-2xl text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C85B3E] font-display text-2xl font-bold text-white shadow-lg">
              M
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">Intranet & CRM</p>
              <h1 className="font-display text-2xl font-bold">Moon Paracas</h1>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/60 leading-relaxed">
            Portal exclusivo para asesores comerciales, control de inventario de 450 lotes y gestión de expedientes de adjudicación.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Identidad del Asesor
              </label>
              <select
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161310] px-4 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              >
                <option value="Diego Sullivan (Jefatura Comercial)">Diego Sullivan (Jefatura Comercial)</option>
                <option value="Asesor Comercial Senior (Lima)">Asesor Comercial Senior (Lima)</option>
                <option value="Coordinador de Ventas Paracas">Coordinador de Ventas Paracas</option>
                <option value="Mesa de Control & Adjudicaciones">Mesa de Control & Adjudicaciones</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                PIN de Seguridad
              </label>
              <input
                type="password"
                placeholder="Ingresa clave autorizada (ej. moon2026)"
                value={accessPin}
                onChange={(e) => {
                  setAccessPin(e.target.value);
                  setPinError(false);
                }}
                className={`w-full rounded-xl border px-4 py-2.5 text-xs text-white outline-none transition ${
                  pinError
                    ? "border-red-500 bg-red-950/20"
                    : "border-white/10 bg-[#161310] focus:border-[#C5A059]"
                }`}
                autoFocus
              />
              {pinError && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Clave incorrecta. Clave autorizada: moon2026
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C85B3E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#C85B3E]/30 transition hover:bg-[#A84F36] cursor-pointer"
            >
              Acceder al Intranet
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <Link to="/" className="text-[11px] text-white/50 hover:text-white transition">
              ← Volver al sitio web comercial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── INTRANET PRINCIPAL (SIN SUPERPOSICIONES) ──
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#161310] font-sans">
      {/* ── TOP NAV BAR DEL CRM ── */}
      <header className="sticky top-0 z-40 border-b border-[#E8E1D5] bg-white/95 backdrop-blur-md px-5 py-3.5 shadow-sm">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#161310] font-display text-lg font-bold text-white shadow">
              M
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#161310]">Moon Paracas</span>
                <span className="rounded-full bg-[#4E6646]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4E6646]">
                  CRM · Inventario Real Live
                </span>
              </div>
              <p className="text-[11px] text-[#786F66]">
                Conectado como: <strong className="text-[#161310]">{advisorName}</strong>
              </p>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <nav className="flex items-center rounded-2xl border border-[#E8E1D5] bg-[#F4EFE6] p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "pipeline"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Pipeline Leads ({kpis.totalLeads})</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Inventario Excel ({kpis.totalLotsCount} Lotes)</span>
            </button>

            <button
              onClick={() => setActiveTab("proforma")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "proforma"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Cotizador Proforma</span>
            </button>

            <button
              onClick={() => setActiveTab("commissions")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                activeTab === "commissions"
                  ? "bg-[#161310] text-white shadow"
                  : "text-[#786F66] hover:text-[#161310]"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Comisiones</span>
            </button>
          </nav>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2">
            <Link
              to="/simulador"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 text-xs font-bold text-[#161310] hover:bg-[#FAF8F5] transition"
            >
              <span>Ver Simulador</span>
              <ExternalLink className="h-3 w-3 text-[#786F66]" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI METRICS CARDS (BARRA DE CONTROL CONSOLIDADA) ── */}
      <section className="border-b border-[#E8E1D5] bg-[#F4EFE6] px-5 py-6">
        <div className="mx-auto max-w-[1440px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E8E1D5] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Leads Totales</span>
              <Users className="h-4 w-4 text-[#A84F36]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#161310]">{kpis.totalLeads}</p>
            <p className="text-[10px] text-[#4E6646] font-semibold">Base en vivo</p>
          </div>

          <div className="rounded-2xl border border-[#C85B3E]/30 bg-[#C85B3E]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Nuevos (SLA 15m)</span>
              <Clock className="h-4 w-4 text-[#C85B3E]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#C85B3E]">{kpis.newLeads}</p>
            <p className="text-[10px] text-[#A84F36]">Por atender</p>
          </div>

          <div className="rounded-2xl border border-[#4E6646]/30 bg-[#4E6646]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E6646]">Disponibles</span>
              <Building2 className="h-4 w-4 text-[#4E6646]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#4E6646]">{kpis.availableLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">De {kpis.totalLotsCount} lotes</p>
          </div>

          <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Separados</span>
              <Sparkles className="h-4 w-4 text-[#C5A059]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#A84F36]">{kpis.reservedLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">Con S/ 1,000</p>
          </div>

          <div className="rounded-2xl border border-[#161310]/20 bg-[#161310]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#161310]">Vendidos</span>
              <CheckCircle2 className="h-4 w-4 text-[#161310]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[#161310]">{kpis.soldLotsCount}</p>
            <p className="text-[10px] text-[#786F66]">Contrato notarial</p>
          </div>

          <div className="rounded-2xl border border-[#C5A059]/40 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Área Vendible</span>
              <DollarSign className="h-4 w-4 text-[#C5A059]" />
            </div>
            <p className="mt-2 font-display text-xl font-bold text-[#161310]">{kpis.totalAreaM2.toLocaleString()} m²</p>
            <p className="text-[10px] text-[#786F66]">Inventario consolidado</p>
          </div>
        </div>
      </section>

      {/* ── CUERPO PRINCIPAL SEGÚN PESTAÑA ACTIVA ── */}
      <main className="mx-auto max-w-[1440px] px-5 py-8">
        
        {/* ══════════ PESTAÑA 1: PIPELINE DE LEADS (CRM) ══════════ */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#161310]">Embudo Comercial & Gestión de Leads</h2>
                <p className="text-xs text-[#786F66]">
                  Prospectos registrados en tiempo real. Respóndeles por WhatsApp en menos de 15 minutos para maximizar la conversión.
                </p>
              </div>

              {/* Botón Añadir Lead Manual y Filtros */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#C85B3E] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#A84F36] transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Registrar Prospecto Manual</span>
                </button>

                <div className="flex items-center gap-2 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 shadow-sm text-xs w-full sm:w-60">
                  <Search className="h-3.5 w-3.5 text-[#786F66]" />
                  <input
                    type="text"
                    placeholder="Buscar nombre o teléfono..."
                    value={searchLead}
                    onChange={(e) => setSearchLead(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#161310] placeholder-[#786F66]"
                  />
                </div>

                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todas las Etapas</option>
                  <option value="new">Nuevo (SLA 15m)</option>
                  <option value="contacted">Contactado</option>
                  <option value="visit_scheduled">Visita Agendada</option>
                  <option value="reservation_pending">Separación en Trámite</option>
                  <option value="closed_won">Cierre Ganado</option>
                  <option value="discarded">Descartado</option>
                </select>
              </div>
            </div>

            {/* Modal para Crear Lead Manual */}
            {showAddLeadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] border border-[#C5A059]/40 p-6 sm:p-8 shadow-2xl">
                  <button
                    onClick={() => setShowAddLeadModal(false)}
                    className="absolute top-5 right-5 p-2 rounded-full bg-white border border-[#E8E1D5] text-[#161310] hover:bg-[#161310] hover:text-white transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <h3 className="font-display text-xl font-bold text-[#161310]">Registrar Prospecto Manual</h3>
                  <p className="mt-1 text-xs text-[#786F66]">
                    Agrega un nuevo interesado recibido por llamada telefónica, referidos directos o showroom presencial.
                  </p>

                  <form onSubmit={handleCreateManualLead} className="mt-5 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Roberto Benavides"
                        value={newLeadForm.name}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                        className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2 text-xs text-[#161310] outline-none focus:border-[#C85B3E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+51 998 765 432"
                          value={newLeadForm.phone}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                          className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2 text-xs text-[#161310] outline-none focus:border-[#C85B3E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                          Email (Opcional)
                        </label>
                        <input
                          type="email"
                          placeholder="cliente@correo.com"
                          value={newLeadForm.email}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                          className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2 text-xs text-[#161310] outline-none focus:border-[#C85B3E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                          Lote de Interés
                        </label>
                        <select
                          value={newLeadForm.selectedLotId}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, selectedLotId: e.target.value })}
                          className="w-full rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs text-[#161310] outline-none"
                        >
                          {CONSOLIDATED_INVENTORY.slice(0, 50).map((lot) => (
                            <option key={lot.id} value={lot.id}>
                              {lot.id} · {lot.name} ({lot.areaM2}m²)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                          Distrito Residencia
                        </label>
                        <input
                          type="text"
                          placeholder="Surco, Miraflores, San Isidro..."
                          value={newLeadForm.district}
                          onChange={(e) => setNewLeadForm({ ...newLeadForm, district: e.target.value })}
                          className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2 text-xs text-[#161310] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#38312B] mb-1">
                        Notas Comerciales
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Interesado en lote estándar, desea financiamiento a 36 meses..."
                        value={newLeadForm.message}
                        onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                        className="w-full rounded-xl border border-[#E8E1D5] bg-white px-4 py-2 text-xs text-[#161310] outline-none focus:border-[#C85B3E]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLeadModal(false)}
                        className="rounded-xl border border-[#E8E1D5] px-4 py-2 text-xs font-bold text-[#786F66] hover:bg-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#C85B3E] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#A84F36]"
                      >
                        Guardar Prospecto
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Listado de Tarjetas de Leads o Estado Vacío */}
            {filteredLeads.length === 0 ? (
              <div className="rounded-3xl border border-[#E8E1D5] bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C5A059]/15 text-[#A84F36]">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#161310] mt-4">
                  Bandeja de Prospectos en Tiempo Real
                </h3>
                <p className="mt-1 text-xs text-[#786F66] max-w-md mx-auto">
                  {searchLead || stageFilter !== "all"
                    ? "No se encontraron prospectos con los filtros actuales."
                    : "No hay consultas pendientes en la base de datos de Firestore. Las solicitudes enviadas desde los modales de Dossier o Showroom de la web aparecerán aquí en vivo."}
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C85B3E] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#A84F36] transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Registrar Primer Prospecto Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => {
                  const waMessage = `Hola ${lead.name.split(" ")[0]}! Te saluda ${advisorName} de Moon Paracas. Recibimos tu interés sobre ${lead.selectedLotId ? `el Lote ${lead.selectedLotId}` : "el proyecto Moon Paracas"}. ¿En qué momento te resulta más cómodo conversar sobre la disponibilidad y facilidades de pago?`;
                  const waUrl = `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

                  return (
                    <div
                      key={lead.id}
                      className="flex flex-col justify-between rounded-3xl border border-[#E8E1D5] bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        {/* Cabecera del Lead */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#E8E1D5] pb-3">
                          <div>
                            <span className="font-mono text-[10px] text-[#786F66]">ID: {lead.id.slice(0, 10)}</span>
                            <h3 className="font-display text-base font-bold text-[#161310] mt-0.5">{lead.name}</h3>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              lead.pipelineStage === "new"
                                ? "bg-red-100 text-red-700 animate-pulse"
                                : lead.pipelineStage === "reservation_pending"
                                ? "bg-[#C5A059]/20 text-[#A84F36]"
                                : lead.pipelineStage === "closed_won"
                                ? "bg-[#4E6646]/20 text-[#4E6646]"
                                : "bg-[#F4EFE6] text-[#786F66]"
                            }`}
                          >
                            {lead.pipelineStage === "new" && "Nuevo (SLA)"}
                            {lead.pipelineStage === "contacted" && "Contactado"}
                            {lead.pipelineStage === "visit_scheduled" && "Visita Agendada"}
                            {lead.pipelineStage === "reservation_pending" && "En Separación"}
                            {lead.pipelineStage === "closed_won" && "Cierre Ganado"}
                            {lead.pipelineStage === "discarded" && "Descartado"}
                          </span>
                        </div>

                        {/* Datos de Contacto */}
                        <div className="mt-3 space-y-1.5 text-xs text-[#524941]">
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-[#C85B3E]" />
                            <a href={`tel:${lead.phone}`} className="font-mono font-semibold hover:underline">
                              {lead.phone}
                            </a>
                          </p>
                          {lead.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-[#786F66]" />
                              <span className="truncate">{lead.email}</span>
                            </p>
                          )}
                          {lead.district && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-[#4E6646]" />
                              <span>{lead.district}</span>
                            </p>
                          )}
                          {lead.selectedLotId && (
                            <p className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>Lote de interés: <strong className="font-mono text-[#161310]">{lead.selectedLotId}</strong></span>
                            </p>
                          )}
                        </div>

                        {/* Mensaje / Nota */}
                        {lead.message && (
                          <div className="mt-3 rounded-xl bg-[#FAF8F5] p-3 text-xs text-[#524941] italic border border-[#E8E1D5]">
                            "{lead.message}"
                          </div>
                        )}
                      </div>

                      {/* Acciones de la Tarjeta */}
                      <div className="mt-4 border-t border-[#E8E1D5] pt-3 flex items-center justify-between gap-2">
                        <select
                          value={lead.pipelineStage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                          className="rounded-lg border border-[#E8E1D5] bg-[#FAF8F5] px-2 py-1 text-[11px] font-semibold text-[#161310] outline-none"
                        >
                          <option value="new">Nuevo</option>
                          <option value="contacted">Contactado</option>
                          <option value="visit_scheduled">Visita</option>
                          <option value="reservation_pending">Separación</option>
                          <option value="closed_won">Ganado</option>
                          <option value="discarded">Descartar</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadLeadIntoProforma(lead)}
                            className="rounded-lg border border-[#E8E1D5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#161310] hover:bg-[#FAF8F5] transition cursor-pointer"
                            title="Cotizar en Proforma"
                          >
                            Cotizar
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#4E6646] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#3D5237] transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ PESTAÑA 2: CONTROL DE INVENTARIO EXCEL CONSOLIDADO (450 LOTES) ══════════ */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-bold text-[#161310]">Inventario Oficial Consolidado</h2>
                  <span className="rounded-full bg-[#4E6646]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase text-[#4E6646]">
                    450 Lotes Reales
                  </span>
                </div>
                <p className="text-xs text-[#786F66]">
                  Sincronizado con el archivo maestro de Google Drive: <em>04_Inventario_General_Consolidado.csv</em>.
                </p>
              </div>

              {/* Filtros de Inventario */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-[#E8E1D5] bg-white px-3 py-1.5 shadow-sm text-xs">
                  <Search className="h-3.5 w-3.5 text-[#786F66]" />
                  <input
                    type="text"
                    placeholder="Filtrar por ID (ej. L014)..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-36 bg-transparent outline-none text-[#161310]"
                  />
                </div>

                <select
                  value={inventoryBlockFilter}
                  onChange={(e) => setInventoryBlockFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todas las Manzanas (M1 a M24)</option>
                  {allBlocks.map((b) => (
                    <option key={b} value={b}>Manzana {b}</option>
                  ))}
                </select>

                <select
                  value={inventoryTypologyFilter}
                  onChange={(e) => setInventoryTypologyFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todas las Tipologías</option>
                  {allTypologies.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#E8E1D5] bg-white px-3 py-2 text-xs font-semibold text-[#161310] outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="available">Disponible</option>
                  <option value="reserved">Separado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>

            {/* Tabla de Inventario de 450 Lotes */}
            <div className="overflow-x-auto rounded-3xl border border-[#E8E1D5] bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E8E1D5] bg-[#F4EFE6] text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
                  <tr>
                    <th className="px-5 py-3.5">ID Elemento</th>
                    <th className="px-4 py-3.5">Nombre & Manzana</th>
                    <th className="px-4 py-3.5">Tipología</th>
                    <th className="px-4 py-3.5">Área Real (m²)</th>
                    <th className="px-4 py-3.5">Dimensiones</th>
                    <th className="px-4 py-3.5">Precio (S/)</th>
                    <th className="px-4 py-3.5">Precio ($ USD)</th>
                    <th className="px-4 py-3.5">Dist. Oasis</th>
                    <th className="px-4 py-3.5">Estado Oficial</th>
                    <th className="px-5 py-3.5 text-right">Modificar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E1D5]">
                  {filteredInventory.slice(0, 100).map((lot) => {
                    return (
                      <tr key={lot.id} className="hover:bg-[#FAF8F5] transition">
                        <td className="px-5 py-3 font-mono font-bold text-[#161310]">{lot.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#161310]">
                          {lot.name} <span className="font-mono text-[10px] text-[#786F66]">({lot.block})</span>
                        </td>
                        <td className="px-4 py-3 text-[#524941]">
                          <span className="rounded-md bg-[#FAF8F5] border border-[#E8E1D5] px-2 py-0.5 text-[10px]">
                            {lot.typology}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[#161310]">
                          {lot.areaM2.toFixed(2)} m²
                        </td>
                        <td className="px-4 py-3 font-mono text-[#786F66]">{lot.dimensions}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#161310]">
                          S/ {lot.pricePen.toLocaleString("es-PE")}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-[#4E6646]">
                          ${lot.priceUsd.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-[#786F66]">
                          {lot.distanceOasisM} m
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              lot.effectiveStatus === "available"
                                ? "bg-[#4E6646]/10 text-[#4E6646]"
                                : lot.effectiveStatus === "reserved"
                                ? "bg-[#C5A059]/20 text-[#A84F36]"
                                : "bg-[#161310] text-white"
                            }`}
                          >
                            {lot.effectiveStatus === "available" && "Disponible"}
                            {lot.effectiveStatus === "reserved" && "Separado"}
                            {lot.effectiveStatus === "sold" && "Vendido"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex rounded-lg border border-[#E8E1D5] bg-white p-0.5 shadow-xs">
                            <button
                              onClick={() => toggleLotStatus(lot.id, "available")}
                              title="Marcar como Disponible"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "available" ? "bg-[#4E6646] text-white" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Disp
                            </button>
                            <button
                              onClick={() => toggleLotStatus(lot.id, "reserved")}
                              title="Marcar como Separado"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "reserved" ? "bg-[#C5A059] text-[#161310]" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Sep
                            </button>
                            <button
                              onClick={() => toggleLotStatus(lot.id, "sold")}
                              title="Marcar como Vendido"
                              className={`rounded px-2 py-0.5 text-[9px] font-bold cursor-pointer transition ${
                                lot.effectiveStatus === "sold" ? "bg-[#161310] text-white" : "text-[#786F66] hover:bg-[#FAF8F5]"
                              }`}
                            >
                              Ven
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInventory.length > 100 && (
                <div className="border-t border-[#E8E1D5] bg-[#FAF8F5] p-3 text-center text-xs text-[#786F66]">
                  Mostrando los primeros 100 de {filteredInventory.length} lotes. Usa los filtros de Manzana o Tipología para acotar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ PESTAÑA 3: COTIZADOR PROFORMA EXPRESS ══════════ */}
        {activeTab === "proforma" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulario de Parámetros */}
            <div className="lg:col-span-5 rounded-3xl border border-[#E8E1D5] bg-white p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Generador de Cotización</span>
                <h2 className="font-display text-xl font-bold text-[#161310]">Datos del Inversionista</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#786F66] mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  placeholder="Ej. Roberto Benavides Miró Quesada"
                  value={proformaClientName}
                  onChange={(e) => setProformaClientName(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">DNI / CE</label>
                  <input
                    type="text"
                    placeholder="45892100"
                    value={proformaClientDni}
                    onChange={(e) => setProformaClientDni(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-mono font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="+51 987 654 321"
                    value={proformaClientPhone}
                    onChange={(e) => setProformaClientPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-mono font-semibold text-[#161310] outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#786F66] mb-1">Seleccionar Lote de la Matriz (450 Lotes)</label>
                <select
                  value={proformaLotId}
                  onChange={(e) => setProformaLotId(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E1D5] px-3.5 py-2 text-xs font-bold text-[#161310] outline-none focus:border-[#C5A059]"
                >
                  {allLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} · {lot.name} ({lot.block}) · {lot.areaM2.toFixed(1)}m² — ${lot.priceUsd.toLocaleString()} USD
                    </option>
                  ))}
                </select>
              </div>

              {/* Parámetros de Financiamiento */}
              <div className="border-t border-[#E8E1D5] pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">
                    Cuota Inicial: <strong>{Math.round(proformaDownRatio * 100)}%</strong> ($
                    {proformaCalculations.downPaymentUsd.toLocaleString()} USD)
                  </label>
                  <div className="flex gap-2">
                    {[0.2, 0.3, 0.4, 0.5].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setProformaDownRatio(ratio)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                          proformaDownRatio === ratio
                            ? "bg-[#C85B3E] text-white"
                            : "bg-[#FAF8F5] border border-[#E8E1D5] text-[#161310]"
                        }`}
                      >
                        {Math.round(ratio * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#786F66] mb-1">
                    Plazo de Financiamiento Directo: <strong>{proformaMonths} meses</strong>
                  </label>
                  <div className="flex gap-2">
                    {[12, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setProformaMonths(m)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                          proformaMonths === m
                            ? "bg-[#161310] text-white"
                            : "bg-[#FAF8F5] border border-[#E8E1D5] text-[#161310]"
                        }`}
                      >
                        {m} meses
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones de Compartir */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopyQuoteToClipboard}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4E6646] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#3D5237] transition cursor-pointer"
                >
                  {copiedQuote ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedQuote ? "¡Copiado al Portapapeles!" : "Copiar Texto para WhatsApp"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#161310] bg-white py-2.5 text-xs font-bold text-[#161310] hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir / Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* Vista Previa de la Proforma Oficial */}
            <div className="lg:col-span-7 rounded-3xl border border-[#C5A059]/40 bg-white p-8 sm:p-10 shadow-lg print:border-none print:shadow-none print:m-0 print:p-0">
              <div className="flex items-start justify-between border-b border-[#E8E1D5] pb-6">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-[#161310]">
                    MOON <span className="font-serif italic font-normal text-[#C85B3E]">PARACAS</span>
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#786F66] mt-0.5">
                    Eco-Resort & Club Privado · Paracas, Ica
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#C5A059]/15 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#A84F36]">
                    Proforma Oficial 2026
                  </span>
                  <p className="mt-1 font-mono text-[10px] text-[#786F66]">
                    Fecha: {new Date().toLocaleDateString("es-PE")}
                  </p>
                </div>
              </div>

              {/* Destinatario */}
              <div className="mt-6 rounded-2xl bg-[#FAF8F5] p-4 text-xs border border-[#E8E1D5]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#786F66]">Titular Solicitante</p>
                <p className="mt-1 font-display text-base font-bold text-[#161310]">
                  {proformaClientName || "Inversionista Interesado"}
                </p>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-[#524941]">
                  <span>DNI/CE: <strong className="font-mono">{proformaClientDni || "—"}</strong></span>
                  <span>Móvil: <strong className="font-mono">{proformaClientPhone || "—"}</strong></span>
                  <span>Asesor: <strong>{advisorName}</strong></span>
                </div>
              </div>

              {/* Detalle del Lote */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36] mb-3">
                  Especificación de la Adjudicación
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Lote N°</span>
                    <span className="font-display text-lg font-bold text-[#161310]">{selectedProformaLot.id}</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Manzana</span>
                    <span className="font-display text-xs font-bold text-[#161310]">{selectedProformaLot.block}</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Área Total</span>
                    <span className="font-display text-lg font-bold text-[#161310]">{selectedProformaLot.areaM2.toFixed(2)} m²</span>
                  </div>
                  <div className="rounded-xl border border-[#E8E1D5] p-3">
                    <span className="text-[9px] text-[#786F66] block">Medidas</span>
                    <span className="font-mono text-xs font-bold text-[#161310]">{selectedProformaLot.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Desglose Económico */}
              <div className="mt-6 border-t border-[#E8E1D5] pt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36] mb-3">
                  Resumen de Inversión y Financiamiento
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Precio Total de Adjudicación</span>
                    <span className="font-mono font-bold text-[#161310]">${proformaCalculations.priceUsd.toLocaleString()} USD (~S/ {proformaCalculations.pricePen.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Monto de Separación Notarial (Deducible)</span>
                    <span className="font-mono font-bold text-[#4E6646]">S/ {proformaCalculations.reservationPen} PEN (~${proformaCalculations.reservationUsd} USD)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Cuota Inicial Pactada ({Math.round(proformaDownRatio * 100)}%)</span>
                    <span className="font-mono font-bold text-[#161310]">${proformaCalculations.downPaymentUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E8E1D5]">
                    <span className="text-[#524941]">Saldo a Financiar Directamente</span>
                    <span className="font-mono font-bold text-[#786F66]">${proformaCalculations.financedUsd.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-[#FAF8F5] rounded-xl px-4 border border-[#C5A059]/40 mt-3">
                    <div>
                      <span className="block font-bold text-xs text-[#161310]">Cuota Mensual Fija ({proformaMonths} meses)</span>
                      <span className="text-[10px] text-[#4E6646]">0% Interés bancario directo</span>
                    </div>
                    <span className="font-display text-2xl font-bold text-[#A84F36]">
                      ${proformaCalculations.monthlyInstallmentUsd} <span className="text-xs font-sans text-[#786F66]">USD / mes</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Términos y Validez */}
              <div className="mt-8 border-t border-[#E8E1D5] pt-4 text-[10px] text-[#786F66] leading-relaxed">
                <p>
                  * Esta cotización tiene una vigencia de 7 días calendario. La reserva formal del lote se asegura mediante abono de S/ 1,000 en la cuenta recaudadora autorizada de la Asociación y suscripción de la Constancia de Adjudicación. Lote matriz de 11.26 ha georreferenciado con coordenadas oficiales UTM 18S.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ══════════ PESTAÑA 4: CALCULADORA DE COMISIONES ══════════ */}
        {activeTab === "commissions" && (
          <div className="max-w-3xl mx-auto rounded-3xl border border-[#E8E1D5] bg-white p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Plan de Incentivos Comerciales</span>
              <h2 className="font-display text-2xl font-bold text-[#161310]">Calculadora de Comisiones de Asesor</h2>
              <p className="text-xs text-[#786F66] mt-1">
                Herramienta interna para proyectar comisiones por volumen de ventas y cumplimiento de cuota mensual.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Lote 120m² ($14,400)</span>
                <p className="font-display text-2xl font-bold text-[#4E6646] mt-1">$576 USD</p>
                <p className="text-[10px] text-[#786F66]">Comisión Base 4.0%</p>
              </div>

              <div className="rounded-2xl border border-[#E8E1D5] bg-[#FAF8F5] p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F66]">Lote Doble 240m² ($28,800)</span>
                <p className="font-display text-2xl font-bold text-[#4E6646] mt-1">$1,152 USD</p>
                <p className="text-[10px] text-[#786F66]">Comisión Base 4.0%</p>
              </div>

              <div className="rounded-2xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A84F36]">Bono por 5 Cierres</span>
                <p className="font-display text-2xl font-bold text-[#A84F36] mt-1">+$1,000 USD</p>
                <p className="text-[10px] text-[#A84F36]">Acelerador de Meta</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E1D5] p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold text-[#161310] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#C5A059]" /> Reglas de Desembolso de Comisiones
              </h4>
              <ul className="text-xs text-[#524941] space-y-2 list-disc pl-5">
                <li>El 50% de la comisión se libera al abonarse el total de la Cuota Inicial (30%).</li>
                <li>El 50% restante se liquida tras la firma notarial del Contrato de Incorporación y Adjudicación.</li>
                <li>Los bonos por acelerador se liquidan al cierre de mes contable (días 30 de cada mes).</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
