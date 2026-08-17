export type ReservationClientData = {
  name: string;
  dni: string;
  email: string;
  phone: string;
  monthlyAmount: number;
  installmentsCount: number;
  isCash: boolean;
  offerId?: string;
  offerName?: string;
  totalPrice?: number;
  addOnsTotal?: number;
  addOnIds?: string[];
  downPaymentPercent?: number;
};
