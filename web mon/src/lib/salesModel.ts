import { Lot, SalesFilters } from "../types/map";

export function filterLots(lots: Lot[], filters: SalesFilters): Lot[] {
  return lots.filter(lot => {
    const matchesSearch =
      !filters.search ||
      lot.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      lot.blockId.toLowerCase().includes(filters.search.toLowerCase());

    const matchesBlock = filters.blockId === "all" || lot.blockId === filters.blockId;
    const matchesStatus = filters.status === "all" || lot.status === filters.status;
    const matchesTypology = filters.typology === "all" || lot.typology === filters.typology;

    return matchesSearch && matchesBlock && matchesStatus && matchesTypology;
  });
}
