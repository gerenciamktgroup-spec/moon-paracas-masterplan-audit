import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { trackEvent } from "./analytics";

export interface NewLeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  selectedLotId?: string;
  projectInterest?: string;
  inquiryType?: string;
  contactWindow?: string;
  district?: string;
  channel?: string;
  notes?: string;
}

export async function submitLead(input: NewLeadInput): Promise<{ success: boolean; leadId?: string }> {
  const cleanLead = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: (input.email || "").trim().toLowerCase(),
    message: (input.message || "").trim(),
    selectedLotId: input.selectedLotId || null,
    projectInterest: input.projectInterest || "Moon Paracas",
    inquiryType: input.inquiryType || "information",
    contactWindow: input.contactWindow || "morning",
    district: input.district || null,
    channel: input.channel || "web-modal",
    pipelineStage: "new" as const,
    slaTargetMinutes: 15,
    advisorNotes: input.notes || "",
    createdAt: serverTimestamp(),
  };

  trackEvent("lead_submitted", {
    channel: cleanLead.channel,
    inquiryType: cleanLead.inquiryType,
    selectedLotId: cleanLead.selectedLotId || "none",
  });

  let createdId: string | undefined = undefined;

  // 1. Escritura directa en Firestore
  try {
    const leadsRef = collection(db, "leads");
    const docRef = await addDoc(leadsRef, cleanLead);
    createdId = docRef.id;
  } catch (firestoreErr) {
    console.warn("Firestore client write notice:", firestoreErr);
  }

  // 2. Notificación asíncrona a la API backend
  try {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanLead),
    }).catch(() => {});
  } catch {
    // API no-op
  }

  return { success: true, leadId: createdId };
}
