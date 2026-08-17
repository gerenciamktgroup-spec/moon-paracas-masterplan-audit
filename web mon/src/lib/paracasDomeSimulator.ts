import {
  PARACAS_DOME_FINANCING_RULES,
  PARACAS_DOME_ADD_ONS,
  OfferId,
  getAddOnPublicPrice,
  getOfferById
} from "../data/paracasDome";

export type FinancingSimulationInput = {
  offerId: OfferId;
  addOnIds?: string[];
  addOnsTotal?: number;
  downPaymentPercent?: number;
  months?: number;
};

export type FinancingSimulationResult = {
  offerPrice: number;
  addOnsTotal: number;
  totalPrice: number;
  reservation: number;
  downPayment: number;
  signingPayment: number;
  financedAmount: number;
  flatInterest: number;
  financedTotal: number;
  monthlyPayment: number;
  downPaymentPercent: number;
  months: number;
};

export function simulateParacasDomeFinancing({
  offerId,
  addOnIds = [],
  addOnsTotal,
  downPaymentPercent = PARACAS_DOME_FINANCING_RULES.minDownPaymentPercent,
  months = PARACAS_DOME_FINANCING_RULES.maxInstallments
}: FinancingSimulationInput): FinancingSimulationResult {
  const {
    reservation,
    minDownPaymentPercent,
    maxInstallments,
    flatInterestPercent
  } = PARACAS_DOME_FINANCING_RULES;

  if (downPaymentPercent < minDownPaymentPercent) {
    throw new Error("La inicial minima es 50%.");
  }

  if (months < 1 || months > maxInstallments) {
    throw new Error(`El plazo debe estar entre 1 y ${maxInstallments} meses.`);
  }

  const offer = getOfferById(offerId);
  const selectedAddOnsTotal =
    typeof addOnsTotal === "number"
      ? addOnsTotal
      : addOnIds.reduce((total, addOnId) => {
          const addOn = PARACAS_DOME_ADD_ONS.find((item) => item.id === addOnId);
          return total + (addOn ? getAddOnPublicPrice(addOn) : 0);
        }, 0);

  const totalPrice = offer.publicPrice + selectedAddOnsTotal;
  const downPayment = totalPrice * (downPaymentPercent / 100);
  const signingPayment = Math.max(downPayment - reservation, 0);
  const financedAmount = totalPrice - downPayment;
  const flatInterest = financedAmount > 0 ? financedAmount * (flatInterestPercent / 100) : 0;
  const financedTotal = financedAmount + flatInterest;
  const monthlyPayment = downPaymentPercent >= 100 ? 0 : financedTotal / months;

  return {
    offerPrice: offer.publicPrice,
    addOnsTotal: selectedAddOnsTotal,
    totalPrice,
    reservation,
    downPayment,
    signingPayment,
    financedAmount,
    flatInterest,
    financedTotal,
    monthlyPayment,
    downPaymentPercent,
    months
  };
}
