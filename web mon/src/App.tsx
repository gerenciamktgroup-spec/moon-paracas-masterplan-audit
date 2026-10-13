import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Lot } from "./types/map";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ShieldCheck } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PageMeta } from "./components/PageMeta";
import { PaymentDialog } from "./components/PaymentDialog";
import { ReservationClientData } from "./types/reservation";
import { PrivacyMetrics } from "./components/PrivacyMetrics";
import { captureAttribution } from "./lib/attribution";
import { trackEvent } from "./lib/analytics";

import { Home } from "./pages/Home";
import { DossierModal } from "./components/home/DossierModal";
import { ShowroomVisitModal } from "./components/home/ShowroomVisitModal";

const Simulator = lazy(() => import("./pages/Simulator").then((module) => ({ default: module.Simulator })));
const Technical = lazy(() => import("./pages/Technical").then((module) => ({ default: module.Technical })));
const Experience = lazy(() => import("./pages/Experience").then((module) => ({ default: module.Experience })));
const Gallery = lazy(() => import("./pages/Gallery").then((module) => ({ default: module.Gallery })));
const ParacasDome = lazy(() => import("./pages/ParacasDome").then((module) => ({ default: module.ParacasDome })));
const NotFound = lazy(() => import("./pages/NotFound").then((module) => ({ default: module.NotFound })));
const LegalPage = lazy(() => import("./pages/Legal").then((module) => ({ default: module.LegalPage })));
const DocumentCenter = lazy(() => import("./pages/DocumentCenter").then((module) => ({ default: module.DocumentCenter })));
const Cielo = lazy(() => import("./pages/Cielo").then((module) => ({ default: module.Cielo })));
const CrmIntranet = lazy(() => import("./pages/CrmIntranet").then((module) => ({ default: module.CrmIntranet })));

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

interface AppShellProps {
  lots: Lot[];
  domeLots: Lot[];
  selectedLot: Lot | null;
  setSelectedLot: (lot: Lot | null) => void;
  selectedDomeLot: Lot | null;
  setSelectedDomeLot: (lot: Lot | null) => void;
  handleReserveLot: (lotId: string, client?: ReservationClientData) => Promise<void>;
  paymentRequest: { lotId: string; client: ReservationClientData } | null;
  setPaymentRequest: (req: { lotId: string; client: ReservationClientData } | null) => void;
  handlePaymentResult: (msg: string) => void;
  toastMessage: string | null;
  dossierOpen: boolean;
  setDossierOpen: (open: boolean) => void;
  showroomOpen: boolean;
  setShowroomOpen: (open: boolean) => void;
}

function AppShell(props: AppShellProps) {
  const location = useLocation();
  const isCrmRoute = ["/crm", "/intranet", "/asesores"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-[100dvh] font-sans selection:bg-[#C85B3E] selection:text-white flex flex-col relative overflow-hidden bg-[#FAF8F5]">
      <div className="fixed inset-0 z-0 bg-[#FAF8F5]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {!isCrmRoute && (
          <Header 
            onOpenDossier={() => props.setDossierOpen(true)}
            onOpenShowroom={() => props.setShowroomOpen(true)}
          />
        )}

        {props.paymentRequest && (
          <PaymentDialog
            lotId={props.paymentRequest.lotId}
            client={props.paymentRequest.client}
            onClose={() => props.setPaymentRequest(null)}
            onResult={props.handlePaymentResult}
          />
        )}

        {/* Toast Notification */}
        {props.toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-white px-5 py-4 text-sm text-[#1C1612] border border-[#E8E1D5] flex items-center gap-3 shadow-[0_16px_40px_rgba(28,22,18,0.12)] animate-fade-in">
            <ShieldCheck className="h-5 w-5 text-[#C85B3E]" />
            <span className="font-bold tracking-wide">{props.toastMessage}</span>
          </div>
        )}

        {/* Modales Globales de Dossier y Showroom */}
        <DossierModal 
          isOpen={props.dossierOpen} 
          onClose={() => props.setDossierOpen(false)} 
        />
        <ShowroomVisitModal 
          isOpen={props.showroomOpen} 
          onClose={() => props.setShowroomOpen(false)} 
        />

        <main className="flex-1 relative z-10">
          <Suspense
            fallback={
              <div className="flex min-h-[55vh] flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center">
                <p className="moon-title text-[#1C1612]">La pampa tarda un segundo en aparecer.</p>
                <p className="mt-3 font-display italic text-lg text-[#A84F36]">Abriendo Moon Paracas</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home lots={props.lots} domeLots={props.domeLots} />} />
              
              <Route path="/simulador" element={
                <Simulator 
                  lots={props.lots} 
                  selectedLot={props.selectedLot} 
                  setSelectedLot={props.setSelectedLot} 
                  handleReserveLot={props.handleReserveLot} 
                />
              } />
              
              <Route path="/paracas-dome/*" element={
                <ParacasDome 
                  lots={props.domeLots} 
                  selectedLot={props.selectedDomeLot} 
                  setSelectedLot={props.setSelectedDomeLot} 
                  handleReserveLot={props.handleReserveLot} 
                />
              } />
              
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/experiencia" element={<Experience />} />
              <Route path="/tecnica" element={<Technical />} />
              <Route path="/documentos" element={<DocumentCenter />} />
              <Route path="/cielo" element={<Cielo />} />
              <Route path="/crm" element={<CrmIntranet />} />
              <Route path="/intranet" element={<CrmIntranet />} />
              <Route path="/asesores" element={<CrmIntranet />} />
              <Route path="/privacidad" element={<LegalPage type="privacy" />} />
              <Route path="/terminos" element={<LegalPage type="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {!isCrmRoute && (
          <>
            <Footer 
              selectedLot={props.selectedLot} 
              onOpenDossier={() => props.setDossierOpen(true)}
              onOpenShowroom={() => props.setShowroomOpen(true)}
            />
            <PrivacyMetrics />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Moon Paracas Lot state
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  
  // Paracas Dome Lot state
  const [domeLots, setDomeLots] = useState<Lot[]>([]);
  const [selectedDomeLot, setSelectedDomeLot] = useState<Lot | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<{ lotId: string; client: ReservationClientData } | null>(null);
  
  // Global modal state for Dossier and Showroom Visit
  const [dossierOpen, setDossierOpen] = useState(false);
  const [showroomOpen, setShowroomOpen] = useState(false);

  useEffect(() => captureAttribution(), []);

  // Build the local geometry first, then merge the public read-only inventory status.
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => undefined;
    const lotsCol = collection(db, "lots");

    const initialize = async () => {
      const { buildMoonParacasInventory } = await import("./lib/masterplanInventory");

      if (!isMounted) return;

      const { allLots } = buildMoonParacasInventory();

      setLots(allLots);
      setSelectedLot(allLots[0]);

      unsubscribe = onSnapshot(lotsCol, (snapshot) => {
        if (isMounted && !snapshot.empty) {
          const remoteLots = new Map(snapshot.docs.map((snapshotDoc) => [snapshotDoc.id, snapshotDoc.data() as Lot]));
          const mergedLots = allLots.map((lot) => {
            const remoteLot = remoteLots.get(lot.id) ?? (lot.legacyId ? remoteLots.get(lot.legacyId) : undefined);
            return {
              ...lot,
              status: lot.status !== "available" ? lot.status : (remoteLot?.status ?? lot.status),
              availableOffers: remoteLot?.availableOffers ?? lot.availableOffers,
              defaultOfferId: remoteLot?.defaultOfferId ?? lot.defaultOfferId,
            };
          });
          setLots(mergedLots);
          setSelectedLot((previous) => mergedLots.find((lot) => lot.id === previous?.id) || mergedLots[0]);
        }
      }, () => {
        // The local model remains usable if the public inventory is temporarily unavailable.
      });
    };

    void initialize();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Paracas Dome uses the same read-only inventory strategy.
  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => undefined;
    const domeLotsCol = collection(db, "dome_lots");

    const initialize = async () => {
      const { buildDomeScene } = await import("./lib/domeModel");
      if (!isMounted) return;

      const domeScene = buildDomeScene();
      setDomeLots(domeScene.lots);
      setSelectedDomeLot(domeScene.lots[0]);

      unsubscribe = onSnapshot(domeLotsCol, (snapshot) => {
        if (isMounted && !snapshot.empty) {
          const remoteLots = new Map(snapshot.docs.map((snapshotDoc) => [snapshotDoc.id, snapshotDoc.data() as Lot]));
          const mergedLots = domeScene.lots.map((lot) => ({ ...lot, ...remoteLots.get(lot.id), polygon: lot.polygon }));
          setDomeLots(mergedLots);
          setSelectedDomeLot((previous) => mergedLots.find((lot) => lot.id === previous?.id) || mergedLots[0]);
        }
      }, () => {
        // Keep the deterministic local geometry as a resilient fallback.
      });
    };

    void initialize();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // MercadoPago Checkout / Reservation handler
  const handleReserveLot = async (
    lotId: string, 
    clientData?: ReservationClientData
  ) => {
    if (!clientData) {
      setToastMessage(`Completa tus datos para iniciar la reserva segura del lote ${lotId}.`);
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    setPaymentRequest({ lotId, client: clientData });
  };

  const handlePaymentResult = useCallback((message: string) => {
    setPaymentRequest(null);
    setToastMessage(message);
    trackEvent("payment_result", { outcome: /aprob|confirm/i.test(message) ? "approved" : "not_approved" });
    window.setTimeout(() => setToastMessage(null), 8000);
  }, []);

  return (
    <BrowserRouter>
      <PageMeta />
      <ScrollToTop />
      <AppShell
        lots={lots}
        domeLots={domeLots}
        selectedLot={selectedLot}
        setSelectedLot={setSelectedLot}
        selectedDomeLot={selectedDomeLot}
        setSelectedDomeLot={setSelectedDomeLot}
        handleReserveLot={handleReserveLot}
        paymentRequest={paymentRequest}
        setPaymentRequest={setPaymentRequest}
        handlePaymentResult={handlePaymentResult}
        toastMessage={toastMessage}
        dossierOpen={dossierOpen}
        setDossierOpen={setDossierOpen}
        showroomOpen={showroomOpen}
        setShowroomOpen={setShowroomOpen}
      />
    </BrowserRouter>
  );
}
