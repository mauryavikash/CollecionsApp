import { Box, Building2, Cpu, Factory, Package, ShoppingBag, Truck, Utensils, Warehouse } from "lucide-react";

const INDUSTRIES = [
  { match: /construction/i, label: "Construction", Icon: Building2, tile: "bg-blue-100 text-blue-600" },
  { match: /logistic/i, label: "Logistics", Icon: Box, tile: "bg-teal-100 text-teal-600" },
  { match: /distribution/i, label: "Distribution", Icon: Warehouse, tile: "bg-violet-100 text-violet-600" },
  { match: /food/i, label: "Foods", Icon: Utensils, tile: "bg-orange-100 text-orange-500" },
  { match: /packag/i, label: "Packaging", Icon: Package, tile: "bg-amber-100 text-amber-600" },
  { match: /tech/i, label: "Technology", Icon: Cpu, tile: "bg-sky-100 text-sky-600" },
  { match: /retail/i, label: "Retail", Icon: ShoppingBag, tile: "bg-pink-100 text-pink-600" },
  { match: /transport|freight/i, label: "Transportation", Icon: Truck, tile: "bg-emerald-100 text-emerald-600" },
];

const FALLBACK = { label: "", Icon: Factory, tile: "bg-slate-100 text-slate-600" };

// The API has no industry field, so it is inferred from the customer name.
export function getIndustry(name = "") {
  return INDUSTRIES.find((industry) => industry.match.test(name)) ?? FALLBACK;
}
