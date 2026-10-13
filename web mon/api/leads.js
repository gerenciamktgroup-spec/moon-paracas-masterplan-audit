import { createHash } from "node:crypto";
import { adminDb, FieldValue } from "./_lib/firebase-admin.js";
import { cleanText, requireAllowedOrigin, setCors } from "./_lib/http.js";
import { deliverLeadToCrm } from "./_lib/crm.js";
import { observeRequest } from "./_lib/logger.js";

const DEFAULT_PROJECT = "Moon Paracas";

export default async function handler(req, res) {
  const log = observeRequest(req, res, "/api/leads");
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  if (!requireAllowedOrigin(req, res)) return;
  if (req.body?.website) return res.status(204).end(); // Honeypot bot protection

  const lead = {
    name: cleanText(req.body?.name, 120),
    email: cleanText(req.body?.email, 160).toLowerCase(),
    phone: cleanText(req.body?.phone || req.body?.whatsapp, 32),
    message: cleanText(req.body?.message, 1000),
    projectInterest: cleanText(req.body?.projectInterest, 40) || DEFAULT_PROJECT,
    selectedLotId: cleanText(req.body?.selectedLotId, 64) || null,
    inquiryType: cleanText(req.body?.inquiryType, 32) || "information",
    contactWindow: cleanText(req.body?.contactWindow, 32) || "flexible",
    district: cleanText(req.body?.district, 64) || null,
    attribution: {
      source: cleanText(req.body?.attribution?.source, 100) || "direct",
      medium: cleanText(req.body?.attribution?.medium, 100) || "website",
      campaign: cleanText(req.body?.attribution?.campaign, 100) || "organic",
      content: cleanText(req.body?.attribution?.content, 100),
      term: cleanText(req.body?.attribution?.term, 100),
      landingPath: cleanText(req.body?.attribution?.landingPath, 160) || "/",
      referrerHost: cleanText(req.body?.attribution?.referrerHost, 120),
    },
  };

  if (lead.name.length < 2 || (lead.phone.replace(/\D/g, "").length < 6 && !lead.email)) {
    return res.status(400).json({ error: "Por favor proporciona un nombre y un teléfono o correo válido." });
  }

  try {
    const hourBucket = new Date().toISOString().slice(0, 13);
    const leadId = createHash("sha256")
      .update(`${lead.email}|${lead.phone.replace(/\D/g, "")}|${hourBucket}`)
      .digest("hex")
      .slice(0, 32);

    try {
      const leadRef = adminDb.collection("leads").doc(leadId);
      await leadRef.set({
        ...lead,
        channel: cleanText(req.body?.channel, 40) || "website-modal",
        pipelineStage: "new",
        slaTargetMinutes: 15,
        crmDeliveryStatus: process.env.CRM_WEBHOOK_URL ? "pending" : "received",
        consentVersion: "privacy-2026-07",
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      try {
        const crmDeliveryStatus = await deliverLeadToCrm(leadId, lead);
        await leadRef.set({ crmDeliveryStatus, crmDeliveryUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
      } catch (crmErr) {
        log.error(crmErr, "crm_delivery_failed");
      }
    } catch (dbErr) {
      log.error(dbErr, "admin_db_write_warn");
      // Resilient fallback: return success so frontend flow is unblocked
    }

    return res.status(201).json({ received: true, id: leadId });
  } catch (error) {
    log.error(error, "lead_creation_failed");
    return res.status(200).json({ received: true, fallback: true });
  }
}
