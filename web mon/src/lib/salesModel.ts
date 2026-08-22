import { Lot, SalesFilters } from "../types/map";

export function filterLots(lots: Lot[], filters: SalesFilters): Lot[] {
  return lots.filter(lot => {
    const matchesSearch =
      !filters.search ||
      lot.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      (lot.blockId && lot.blockId.toLowerCase().includes(filters.search.toLowerCase())) ||
      (lot.quadrant && lot.quadrant.toLowerCase().includes(filters.search.toLowerCase())) ||
      lot.number.toString().includes(filters.search);

    const matchesBlock =
      filters.blockId === "all" ||
      lot.blockId === filters.blockId ||
      (filters.blockId === "C1" && lot.blockId === "A1") ||
      (filters.blockId === "C2" && lot.blockId === "A2") ||
      (filters.blockId === "C3" && lot.blockId === "A3") ||
      (filters.blockId === "C4" && lot.blockId === "A4") ||
      (filters.blockId === "A1" && (lot.blockId === "C1" || lot.blockId === "A1")) ||
      (filters.blockId === "A2" && (lot.blockId === "C2" || lot.blockId === "A2")) ||
      (filters.blockId === "A3" && (lot.blockId === "C3" || lot.blockId === "A3")) ||
      (filters.blockId === "A4" && (lot.blockId === "C4" || lot.blockId === "A4"));

    const matchesStatus = filters.status === "all" || lot.status === filters.status;
    const matchesTypology = filters.typology === "all" || lot.typology === filters.typology;

    return matchesSearch && matchesBlock && matchesStatus && matchesTypology;
  });
}

