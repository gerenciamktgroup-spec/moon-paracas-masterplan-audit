import { createHash } from "node:crypto";
import { adminDb, FieldValue } from "./_lib/firebase-admin.js";
import { cleanText, requireAllowedOrigin, setCors } from "./_lib/http.js";
import { deliverLeadToCrm } from "./_lib/crm.js";
import { observeRequest } from "./_lib/logger.js";

const PROJECTS = new Set(["Moon Paracas", "Paracas Dome"]);
const INQUIRY_TYPES = new Set(["availability", "documents", "visit", "reservation"]);
const CONTACT_WINDOWS = new Set(["morning", "afternoon", "evening"]);

export default async function handler(req, res) {
  const log = observeRequest(req, res, "/api/leads");
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  if (!requireAllowedOrigin(req, res)) return;
  if (req.body?.website) return res.status(204).end();
  if (!process.env.LEGAL_ENTITY_NAME || !process.env.PRIVACY_CONTACT_EMAIL) {
    return res.status(503).json({ error: "El canal de datos personales aún no está habilitado." });
  }

  const lead = {
    name: cleanText(req.body?.name, 120),
    email: cleanText(req.body?.email, 160).toLowerCase(),
    phone: cleanText(req.body?.phone, 32),
    message: cleanText(req.body?.message, 1000),
    projectInterest: cleanText(req.body?.projectInterest, 40),
    selectedLotId: cleanText(req.body?.selectedLotId, 64),
    inquiryType: cleanText(req.body?.inquiryType, 32),
    contactWindow: cleanText(req.body?.contactWindow, 32),
    attribution: {
      source: cleanText(req.body?.attribution?.source, 100) || "direct",
      medium: cleanText(req.body?.attribution?.medium, 100) || "none",
      campaign: cleanText(req.body?.attribution?.campaign, 100),
      content: cleanText(req.body?.attribution?.content, 100),
      term: cleanText(req.body?.attribution?.term, 100),
      landingPath: cleanText(req.body?.attribution?.landingPath, 160),
      referrerHost: cleanText(req.body?.attribution?.referrerHost, 120),
    },
  };

  if (
    lead.name.length < 2 ||
    !/^\S+@\S+\.\S+$/.test(lead.email) ||
    lead.phone.replace(/\D/g, "").length < 7 ||
    !PROJECTS.has(lead.projectInterest) ||
    !INQUIRY_TYPES.has(lead.inquiryType) ||
    !CONTACT_WINDOWS.has(lead.contactWindow) ||
    req.body?.privacyAccepted !== true
  ) {
    return res.status(400).json({ error: "Revisa los datos y acepta el aviso de privacidad." });
  }

  try {
    const hourBucket = new Date().toISOString().slice(0, 13);
    const leadId = createHash("sha256")
      .update(`${lead.email}|${lead.phone.replace(/\D/g, "")}|${hourBucket}`)
      .digest("hex")
      .slice(0, 32);
    const leadRef = adminDb.collection("leads").doc(leadId);

    const created = await adminDb.runTransaction(async (transaction) => {
      if ((await transaction.get(leadRef)).exists) return false;
      transaction.create(leadRef, {
        ...lead,
        channel: "website-footer",
        pipelineStage: "new",
        slaTargetMinutes: 15,
        crmDeliveryStatus: process.env.CRM_WEBHOOK_URL ? "pending" : "not_configured",
        consentVersion: "privacy-2026-07",
        createdAt: FieldValue.serverTimestamp(),
      });
      return true;
    });

    if (!created) return res.status(200).json({ received: true, duplicate: true });

    try {
      const crmDeliveryStatus = await deliverLeadToCrm(leadId, lead);
      await leadRef.set({ crmDeliveryStatus, crmDeliveryUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
    } catch (error) {
      log.error(error, "crm_delivery_failed");
      await leadRef.set({ crmDeliveryStatus: "failed", crmDeliveryUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }

    return res.status(201).json({ received: true });
  } catch (error) {
    log.error(error, "lead_creation_failed");
    return res.status(500).json({ error: "No pudimos registrar la solicitud." });
  }
}
