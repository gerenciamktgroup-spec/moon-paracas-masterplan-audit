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

const Simulator = lazy(() => import("./pages/Simulator").then((module) => ({ default: module.Simulator })));
const Technical = lazy(() => import("./pages/Technical").then((module) => ({ default: module.Technical })));
const Experience = lazy(() => import("./pages/Experience").then((module) => ({ default: module.Experience })));
const Gallery = lazy(() => import("./pages/Gallery").then((module) => ({ default: module.Gallery })));
const ParacasDome = lazy(() => import("./pages/ParacasDome").then((module) => ({ default: module.ParacasDome })));
const NotFound = lazy(() => import("./pages/NotFound").then((module) => ({ default: module.NotFound })));
const LegalPage = lazy(() => import("./pages/Legal").then((module) => ({ default: module.LegalPage })));
const DocumentCenter = lazy(() => import("./pages/DocumentCenter").then((module) => ({ default: module.DocumentCenter })));

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

export default function App() {
  // Moon Paracas Lot state
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  
  // Paracas Dome Lot state
  const [domeLots, setDomeLots] = useState<Lot[]>([]);
  const [selectedDomeLot, setSelectedDomeLot] = useState<Lot | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<{ lotId: string; client: ReservationClientData } | null>(null);

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
              // V4 protects every commercial commitment inherited from V3/V2.2.
              // Stale remote "available" records must never reopen sold, reserved,
              // offer or blocked lots in the public simulator.
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
      <div className="min-h-[100dvh] font-sans selection:bg-[#D95D39] selection:text-white flex flex-col relative overflow-hidden bg-[#0A0807]">
        
        <div className="fixed inset-0 z-0 bg-[#111613]" aria-hidden="true" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />

          {paymentRequest && (
            <PaymentDialog
              lotId={paymentRequest.lotId}
              client={paymentRequest.client}
              onClose={() => setPaymentRequest(null)}
              onResult={handlePaymentResult}
            />
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-stone-900 px-5 py-4 text-sm text-white border border-[#F5F2EB]/15 flex items-center gap-3 shadow-2xl animate-fade-in">
              <ShieldCheck className="h-5 w-5 text-[#D95D39]" />
              <span className="font-bold tracking-wide">{toastMessage}</span>
            </div>
          )}

          <main className="flex-1 relative z-10">
            <Suspense
              fallback={
                <div className="flex min-h-[55vh] items-center justify-center bg-[#111613] text-xs font-bold uppercase text-white/60">
                  Cargando experiencia...
                </div>
              }
            >
              <Routes>
              <Route path="/" element={<Home lots={lots} domeLots={domeLots} />} />
              
              <Route path="/simulador" element={
                <Simulator 
                  lots={lots} 
                  selectedLot={selectedLot} 
                  setSelectedLot={setSelectedLot} 
                  handleReserveLot={handleReserveLot} 
                />
              } />
              
              <Route path="/paracas-dome/*" element={
                <ParacasDome 
                  lots={domeLots} 
                  selectedLot={selectedDomeLot} 
                  setSelectedLot={setSelectedDomeLot} 
                  handleReserveLot={handleReserveLot} 
                />
              } />
              
              <Route path="/galeria" element={<Gallery />} />
              <Route path="/experiencia" element={<Experience />} />
              <Route path="/tecnica" element={<Technical />} />
              <Route path="/documentos" element={<DocumentCenter />} />
              <Route path="/privacidad" element={<LegalPage type="privacy" />} />
              <Route path="/terminos" element={<LegalPage type="terms" />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {/* Global Footer (Contáctanos) */}
          <Footer selectedLot={selectedLot} />
          <PrivacyMetrics />
        </div>
      </div>
    </BrowserRouter>
  );
}
